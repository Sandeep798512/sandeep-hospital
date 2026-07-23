import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import GlassCard from '../components/GlassCard';
import Toast from '../components/Toast';
import Loader from '../components/Loader';
import { User, Lock, Save, Camera, Mail, ShieldAlert } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Profile data state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [address, setAddress] = useState('');
  const [ecName, setEcName] = useState('');
  const [ecRelation, setEcRelation] = useState('');
  const [ecPhone, setEcPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [profileFile, setProfileFile] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/auth/me');
        if (res.data.success) {
          setName(res.data.user.name);
          setProfileImage(res.data.user.profileImage);
          if (res.data.profile) {
            setAge(res.data.profile.age || '');
            setGender(res.data.profile.gender || 'Male');
            setBloodGroup(res.data.profile.bloodGroup || 'O+');
            setAddress(res.data.profile.address || '');
            setEcName(res.data.profile.emergencyContact?.name || '');
            setEcRelation(res.data.profile.emergencyContact?.relation || '');
            setEcPhone(res.data.profile.emergencyContact?.phone || '');
          }
        }
      } catch (err) {
        setToast({ type: 'error', message: 'Failed to load profile details' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);

    let uploadedImageUrl = profileImage;
    if (profileFile) {
      // If profile picture is changed, upload it first using a standard multipart profile update endpoint, or pass base64
      // Let's convert file to base64 for simplicity in profileImage JSON parameter
      const reader = new FileReader();
      reader.readAsDataURL(profileFile);
      reader.onloadend = async () => {
        uploadedImageUrl = reader.result;
        await submitProfile(uploadedImageUrl);
      };
      return;
    }

    await submitProfile(uploadedImageUrl);
  };

  const submitProfile = async (imageUrl) => {
    const data = {
      name,
      profileImage: imageUrl,
    };

    if (user.role === 'patient') {
      data.age = parseInt(age);
      data.gender = gender;
      data.bloodGroup = bloodGroup;
      data.address = address;
      data.emergencyContact = { name: ecName, relation: ecRelation, phone: ecPhone };
    }

    const res = await updateProfile(data);
    setUpdating(false);

    if (res.success) {
      setToast({ type: 'success', message: 'Profile updated successfully!' });
    } else {
      setToast({ type: 'error', message: res.message });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setToast({ type: 'error', message: 'Please enter all password fields' });
      return;
    }

    setChangingPass(true);
    const res = await changePassword({ currentPassword, newPassword });
    setChangingPass(false);

    if (res.success) {
      setToast({ type: 'success', message: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
    } else {
      setToast({ type: 'error', message: res.message });
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Account Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Update your profile parameters, upload avatars, and change password credentials</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile edit form */}
        <GlassCard className="lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200/30 dark:border-slate-800/20 flex items-center space-x-2">
            <User className="w-4.5 h-4.5 text-primary-500" />
            <span>Profile Details</span>
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            {/* Avatar upload check */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative w-20 h-20">
                <img
                  src={profileFile ? URL.createObjectURL(profileFile) : profileImage || `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`}
                  alt="Profile"
                  className="w-full h-full rounded-2xl object-cover border"
                />
                <label className="absolute bottom-[-6px] right-[-6px] p-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white cursor-pointer shadow transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    className="hidden"
                    onChange={e => setProfileFile(e.target.files[0])}
                  />
                </label>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-450 block uppercase">Upload Avatar</span>
                <p className="text-[9px] text-slate-400 mt-0.5">Supports PNG, JPG, or JPEG. Max size 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Email (Read Only)</label>
                <input
                  type="text"
                  readOnly
                  value={user.email}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100/30 dark:bg-slate-900/30 border border-slate-350/10 dark:border-slate-800/10 text-slate-450 focus:outline-none"
                />
              </div>

              {user.role === 'patient' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={e => setAge(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none text-slate-700 dark:text-slate-300"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={e => setBloodGroup(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none text-slate-700 dark:text-slate-300"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>

            {user.role === 'patient' && (
              <div className="border-t border-slate-200/30 dark:border-slate-800/20 pt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">Emergency Contact details</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Person Name</label>
                    <input type="text" value={ecName} onChange={e => setEcName(e.target.value)} className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Relation</label>
                    <input type="text" value={ecRelation} onChange={e => setEcRelation(e.target.value)} className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Phone</label>
                    <input type="text" value={ecPhone} onChange={e => setEcPhone(e.target.value)} className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none" />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={updating}
              className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold transition-all shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>{updating ? 'Saving Profile...' : 'Save Profile Details'}</span>
            </button>
          </form>
        </GlassCard>

        {/* Change password form */}
        <GlassCard className="h-fit">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200/30 dark:border-slate-800/20 flex items-center space-x-2">
            <Lock className="w-4.5 h-4.5 text-rose-500" />
            <span>Update Password</span>
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Current Password *</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">New Password *</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={changingPass}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold shadow-lg transition-all"
            >
              {changingPass ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </GlassCard>

      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Profile;
