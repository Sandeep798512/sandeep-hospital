const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');
const AuditLog = require('../models/AuditLog');
const sendEmail = require('../utils/email');

// Helper to sign JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_123_abc_xyz', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Helper to log audit events
const logAuditEvent = async (userId, email, action, details, req) => {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    await AuditLog.create({
      user: userId || null,
      userEmail: email || 'Anonymous',
      action,
      details,
      ipAddress,
    });
  } catch (err) {
    console.error('Audit Logging Failed:', err.message);
  }
};

/**
 * @desc    Register a new patient user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, age, gender, bloodGroup, address, emergencyContact } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create User (default role is patient)
    const user = await User.create({
      name,
      email,
      password,
      role: 'patient',
      verificationOTP: otp,
      verificationOTPExpires: otpExpires,
    });

    // Create Patient Profile
    const patient = await Patient.create({
      user: user._id,
      name,
      email,
      age,
      gender,
      bloodGroup,
      address,
      emergencyContact,
    });

    // Send verification OTP email
    const emailOptions = {
      to: user.email,
      subject: 'Verify Your Email - Sandeep Hospital',
      text: `Your email verification OTP is: ${otp}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #0b2970;">Welcome to Sandeep Hospital!</h2>
          <p>Please verify your email address to complete your registration.</p>
          <div style="background: #f4f6f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #0b2970; border-radius: 4px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #777;">This code is valid for 10 minutes. If you did not sign up for this account, please ignore this email.</p>
        </div>
      `,
    };
    await sendEmail(emailOptions);

    await logAuditEvent(user._id, user.email, 'Register Patient', `Patient registered successfully with email verification pending. Patient Profile ID: ${patient._id}`, req);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Verification OTP sent to email.',
      userId: user._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user (Admin, Doctor, Receptionist, Patient)
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user and include password field for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      await logAuditEvent(null, email, 'Login Failed', 'Invalid email address attempted login', req);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      await logAuditEvent(user._id, user.email, 'Login Failed', 'Incorrect password entered', req);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isEmailVerified && user.role === 'patient') {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email first. Check your inbox for the OTP code.',
        unverified: true,
        userId: user._id
      });
    }

    // Generate JWT
    const token = generateToken(user._id);

    await logAuditEvent(user._id, user.email, 'Login Success', `User logged in with role: ${user.role}`, req);

    // Filter properties to send back
    const responseUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      isEmailVerified: user.isEmailVerified,
    };

    res.status(200).json({
      success: true,
      token,
      user: responseUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify email with OTP
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ success: false, message: 'User ID and OTP are required' });
    }

    // Fetch user with verification fields
    const user = await User.findById(userId).select('+verificationOTP +verificationOTPExpires');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    // Check OTP
    if (user.verificationOTP !== otp || new Date() > user.verificationOTPExpires) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
    }

    // Verify User
    user.isEmailVerified = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpires = undefined;
    await user.save();

    await logAuditEvent(user._id, user.email, 'Email Verified', 'Email address successfully verified via OTP.', req);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now login.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend OTP verification code
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
const resendOTP = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOTP = otp;
    user.verificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email - Resend OTP - Sandeep Hospital',
      text: `Your new email verification OTP is: ${otp}. Valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #0b2970;">Email Verification OTP</h2>
          <p>Please enter the OTP below to verify your account registration.</p>
          <div style="background: #f4f6f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; color: #0b2970; border-radius: 4px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #777;">Code expires in 10 minutes.</p>
        </div>
      `,
    });

    await logAuditEvent(user._id, user.email, 'OTP Resent', 'Verification OTP resent to user email', req);

    res.status(200).json({
      success: true,
      message: 'New verification OTP sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request forgot password OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with this email' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Reset Password Code - Sandeep Hospital',
      text: `Your password reset code is: ${otp}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #0b2970;">Password Reset Request</h2>
          <p>We received a request to reset your password. Use the verification OTP below:</p>
          <div style="background: #f4f6f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; color: #d9534f; border-radius: 4px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #777;">Valid for 10 minutes. If you did not make this request, safety instructions: secure your account.</p>
        </div>
      `,
    });

    await logAuditEvent(user._id, user.email, 'Forgot Password Triggered', 'Password reset code requested and sent.', req);

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to email.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide all details (email, otp, newPassword)' });
    }

    const user = await User.findOne({ email }).select('+resetPasswordOTP +resetPasswordOTPExpires');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.resetPasswordOTP !== otp || new Date() > user.resetPasswordOTPExpires) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    
    // Automatically verify email if they proved ownership of account
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
    }

    await user.save();

    await logAuditEvent(user._id, user.email, 'Password Reset Success', 'User successfully changed password using reset OTP.', req);

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile (JWT protected)
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    let extraData = {};
    if (user.role === 'patient') {
      extraData = await Patient.findOne({ user: user._id });
    } else if (user.role === 'doctor') {
      const Doctor = require('../models/Doctor');
      extraData = await Doctor.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      profile: extraData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log out user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    await logAuditEvent(req.user._id, req.user.email, 'Logout Success', 'User logged out.', req);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update profile details
 * @route   PUT /api/auth/update-profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, age, gender, bloodGroup, address, emergencyContact, profileImage } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = name || user.name;
    if (profileImage) {
      user.profileImage = profileImage;
    }
    await user.save();

    if (user.role === 'patient') {
      const patient = await Patient.findOne({ user: user._id });
      if (patient) {
        patient.name = name || patient.name;
        patient.age = age || patient.age;
        patient.gender = gender || patient.gender;
        patient.bloodGroup = bloodGroup || patient.bloodGroup;
        patient.address = address || patient.address;
        patient.emergencyContact = emergencyContact || patient.emergencyContact;
        if (profileImage) {
          patient.photoUrl = profileImage;
        }
        await patient.save();
      }
    }

    await logAuditEvent(user._id, user.email, 'Update Profile', 'User updated account details.', req);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new passwords' });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    
    if (!isMatch) {
      await logAuditEvent(user._id, user.email, 'Change Password Failed', 'Incorrect current password input', req);
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    await logAuditEvent(user._id, user.email, 'Change Password Success', 'User updated password from account settings.', req);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendOTP,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
  updateProfile,
  changePassword
};
