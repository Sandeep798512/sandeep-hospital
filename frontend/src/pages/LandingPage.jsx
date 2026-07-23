import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Shield, PhoneCall, Stethoscope, Calendar, 
  Award, Activity, Sparkles, CheckCircle2, ChevronRight, 
  ChevronDown, Users, Phone, MapPin, Mail, Sun, Moon,
  Building2, ArrowRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import GlassCard from '../components/GlassCard';

const LandingPage = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const galleryImages = [
    { src: '/image1.jpg', title: 'Advanced Operation Theatre' },
    { src: '/image2.jpg', title: '24x7 Emergency Ward' },
    { src: '/image3.jpg', title: '3T MRI Diagnostic Wing' },
    { src: '/image4.jpg', title: 'ICU & Critical Trauma Unit' },
    { src: '/image5.jpg', title: 'Robotic Surgery Suite' },
    { src: '/image6.jpg', title: 'Specialist Consultation Chamber' },
    { src: '/img.jpg', title: 'Pediatric Care Ward' },
  ];

  const departments = [
    { title: 'Cardiology', desc: 'Advanced heart care, angioplasty, & cardiac surgery', icon: <Heart className="w-6 h-6 text-rose-500" />, color: 'bg-rose-500/10 text-rose-500' },
    { title: 'Neurology & Neurosurgery', desc: 'Brain, spine, & neuromuscular disorder care', icon: <Activity className="w-6 h-6 text-purple-500" />, color: 'bg-purple-500/10 text-purple-500' },
    { title: 'Orthopedics & Joint Replacement', desc: 'Bone health, robotic knee/hip replacement', icon: <Award className="w-6 h-6 text-blue-500" />, color: 'bg-blue-500/10 text-blue-500' },
    { title: 'General & Laparoscopic Surgery', desc: 'Minimally invasive laser surgeries & emergency care', icon: <Stethoscope className="w-6 h-6 text-emerald-500" />, color: 'bg-emerald-500/10 text-emerald-500' },
    { title: 'Pediatrics & Child Care', desc: 'Comprehensive neonatal & child wellness unit', icon: <Users className="w-6 h-6 text-amber-500" />, color: 'bg-amber-500/10 text-amber-500' },
    { title: 'Diagnostics & Radiology', desc: '3T MRI, 128-Slice CT Scan, & Automated Labs', icon: <Sparkles className="w-6 h-6 text-cyan-500" />, color: 'bg-cyan-500/10 text-cyan-500' },
  ];

  const doctors = [
    { name: 'Dr. Priya Sharma', dept: 'Cardiology', exp: '15+ Yrs Exp', rating: '4.9 ⭐', img: '/priya.jpg' },
    { name: 'Dr. Rahul Verma', dept: 'Neurosurgery', exp: '18+ Yrs Exp', rating: '4.95 ⭐', img: '/rahul v.jpg' },
    { name: 'Dr. Sandeep Gaud', dept: 'Orthopedics & Medical Director', exp: '16+ Yrs Exp', rating: '5.0 ⭐', img: '/sandy.jpg' },
    { name: 'Dr. Ananya Iyer', dept: 'Pediatrics', exp: '12+ Yrs Exp', rating: '4.85 ⭐', img: '/priyaaaa.jpg' },
  ];

  const packages = [
    { title: 'Comprehensive Master Health Check', price: '₹3,499', oldPrice: '₹6,000', tests: '68 Tests included', popular: true },
    { title: 'Executive Cardiac Screening', price: '₹4,200', oldPrice: '₹7,500', tests: 'ECHO, ECG, Lipid, TMT', popular: false },
    { title: 'Senior Citizen Wellness Package', price: '₹2,999', oldPrice: '₹5,200', tests: 'Bone Density, Kidney, Liver', popular: false },
  ];

  const faqs = [
    { q: 'How do I book an online appointment?', a: 'Click on the "Book Consultation" button on our homepage, log in to your patient portal, choose your specialist doctor, date, and preferred time slot.' },
    { q: 'Are emergency and ambulance services available 24/7?', a: 'Yes! Our Emergency Department and Critical ICU unit operate 24 hours a day, 365 days a year. Call our emergency hotline +91-7985126471 for immediate assistance.' },
    { q: 'Does Sandeep Hospital accept cashless insurance policies?', a: 'We partner with over 35 leading health insurance providers (Star Health, HDFC ERGO, ICICI Lombard, etc.) for cashless hospitalization.' },
    { q: 'Can I download my lab reports and prescriptions online?', a: 'Yes. Once logged into your Patient Portal, you can download all PDF prescriptions, medical invoices, and lab diagnostic files instantly.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* TOP EMERGENCY BAR */}
      <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-semibold py-2 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-2">
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span>24/7 Emergency & Ambulance Hotline: <strong>+91 7985126471</strong></span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Maharajganj, Gorakhpur Road, UP</span>
            <span className="hidden md:inline">• NABH Accredited Super Specialty Hospital</span>
            <span className="hidden md:inline">• Cashless TPA Available</span>
          </div>
        </div>
      </div>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-cyan flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-black text-lg text-slate-800 dark:text-white tracking-tight block leading-tight">SANDEEP</span>
              <span className="text-[10px] font-bold tracking-widest text-primary-500 uppercase block">Super Specialty Hospital</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-8 text-xs font-bold text-slate-600 dark:text-slate-300">
            <a href="#departments" className="hover:text-primary-500 hover:scale-105 transition-all">Departments</a>
            <a href="#gallery" className="hover:text-primary-500 hover:scale-105 transition-all">Infrastructure</a>
            <a href="#doctors" className="hover:text-primary-500 hover:scale-105 transition-all">Specialists</a>
            <a href="#packages" className="hover:text-primary-500 hover:scale-105 transition-all">Health Packages</a>
            <a href="#faq" className="hover:text-primary-500 hover:scale-105 transition-all">FAQ</a>
            <a href="#contact" className="hover:text-primary-500 hover:scale-105 transition-all">Contact Us</a>
          </div>

          <div className="flex items-center space-x-3">
            {/* Enhanced Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:scale-110 hover:rotate-12 active:scale-95 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-amber-500/20 cursor-pointer border border-slate-200 dark:border-slate-700/50"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <Sun className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-indigo-600" />
              )}
            </button>

            <Link
              to="/login"
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:border-indigo-600 hover:text-indigo-600 text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              Portal Login
            </Link>

            <Link
              to="/patient/book"
              className="hidden sm:flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 border border-indigo-600"
            >
              <Calendar className="w-4 h-4 text-white" />
              <span className="text-white">Book Consultation</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/20 to-teal-500/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Next-Generation MERN & Gemini AI Healthcare Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                Your Health is <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500">Our Highest Priority</span>
              </h1>

              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
                Sandeep Super Specialty Hospital brings together top-tier medical specialists, advanced robotic surgical units, and Gemini AI diagnostic assistants for precision clinical care in Maharajganj, UP.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/patient/book"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-105 active:scale-95 border border-indigo-600"
                >
                  <Calendar className="w-5 h-5 text-white" />
                  <span className="text-white">Book Appointment Now</span>
                </Link>

                <Link
                  to="/register"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-indigo-600 hover:text-indigo-600 font-extrabold text-sm flex items-center justify-center space-x-2 transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  <Users className="w-5 h-5" />
                  <span>Register Patient Portal</span>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 text-center lg:text-left">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">250+</h3>
                  <p className="text-xs text-slate-500 font-medium">Expert Doctors</p>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">50k+</h3>
                  <p className="text-xs text-slate-500 font-medium">Happy Patients</p>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">99.8%</h3>
                  <p className="text-xs text-slate-500 font-medium">Clinical Accuracy</p>
                </div>
              </div>
            </div>

            {/* FOUNDER & MEDICAL DIRECTOR SPOTLIGHT */}
            <div className="relative">
              <GlassCard className="p-6 sm:p-8 space-y-6 border border-white/40 dark:border-slate-800/40 shadow-2xl overflow-hidden hover:scale-102 transition-transform">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <img
                    src="/SANDEEP GAUD.JPG"
                    alt="Er. Sandeep Gaud"
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-primary-500/30 shadow-xl hover:rotate-2 transition-transform"
                  />
                  <div className="text-center sm:text-left">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-primary-500 bg-primary-500/10 inline-block mb-1">
                      Founder & Chief Architect
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Er. Sandeep Gaud</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Senior MERN Stack Architect & Healthcare Tech Lead</p>
                    <p className="text-[11px] text-slate-400 mt-2 italic leading-relaxed">
                      "Committed to transforming regional healthcare through advanced technology, modern infrastructure, and empathetic patient care."
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-primary-500/5 dark:bg-primary-950/20 border border-primary-500/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-primary-500 uppercase tracking-wider">AI Symptom Assistant</span>
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">Evaluate symptoms instantly before booking</h5>
                  </div>
                  <Link to="/login" className="p-2 rounded-xl bg-primary-500 text-white font-bold hover:bg-primary-600 hover:scale-110 active:scale-95 transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </GlassCard>
            </div>

          </div>
        </div>
      </section>

      {/* HOSPITAL INFRASTRUCTURE GALLERY SLIDER */}
      <section id="gallery" className="py-16 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
          <span className="text-xs font-bold text-primary-500 uppercase tracking-widest">Modern Facilities</span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">Hospital Infrastructure & Wards</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Take a virtual walk through our advanced medical units and operation suites.</p>
        </div>

        <div className="w-full overflow-hidden relative">
          <div className="flex gap-6 animate-marquee hover:pause">
            {[...galleryImages, ...galleryImages].map((img, idx) => (
              <GlassCard key={idx} className="flex-shrink-0 w-80 p-3 overflow-hidden group border border-slate-200/50 dark:border-slate-800/50 hover:scale-105 transition-transform duration-300">
                <img
                  src={img.src}
                  alt={img.title}
                  className="w-full h-48 object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                />
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-3 text-center">{img.title}</h4>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* DEPARTMENTS SECTION */}
      <section id="departments" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-primary-500 uppercase tracking-widest">Centers of Excellence</span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Specialized Medical Departments</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Equipped with state-of-the-art diagnostics and world-acclaimed surgical specialists.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, idx) => (
              <GlassCard key={idx} className="p-6 hover:border-primary-500/50 hover:-translate-y-1 transition-all duration-300 group">
                <div className={`p-3.5 rounded-2xl w-fit ${dept.color} mb-4 group-hover:scale-110 transition-transform`}>
                  {dept.icon}
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">{dept.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{dept.desc}</p>
                <div className="mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-800/40 flex items-center text-xs font-bold text-primary-500 group-hover:translate-x-1.5 transition-transform">
                  <span>Learn More</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* DOCTORS HIGHLIGHTS */}
      <section id="doctors" className="py-16 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-primary-500 uppercase tracking-widest">Medical Faculty</span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Meet Our Leading Specialists</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Board-certified senior doctors dedicated to personalized patient care.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doc, idx) => (
              <GlassCard key={idx} className="p-5 text-center flex flex-col items-center hover:-translate-y-1 transition-transform">
                <img
                  src={doc.img}
                  alt={doc.name}
                  className="w-24 h-24 rounded-3xl object-cover border-2 border-primary-500/20 mb-4 bg-primary-500/5 hover:scale-105 transition-transform"
                />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{doc.name}</h3>
                <span className="px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-bold text-primary-500 bg-primary-500/10">
                  {doc.dept}
                </span>
                <p className="text-[11px] text-slate-400 mt-2">{doc.exp}</p>
                <span className="text-xs font-bold text-amber-500 mt-1">{doc.rating}</span>

                <Link
                  to="/patient/book"
                  className="mt-4 w-full py-2 rounded-xl bg-slate-100 hover:bg-primary-500 hover:text-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all hover:scale-105 active:scale-95"
                >
                  Consult Specialist
                </Link>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* HEALTH PACKAGES */}
      <section id="packages" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-primary-500 uppercase tracking-widest">Preventive Care</span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Curated Health Packages</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Regular wellness checkups for early detection and active health management.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg, idx) => (
              <GlassCard key={idx} className={`p-6 relative flex flex-col justify-between hover:-translate-y-1 transition-transform ${pkg.popular ? 'border-primary-500 ring-2 ring-primary-500/20' : ''}`}>
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary-500 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{pkg.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{pkg.tests}</p>
                  
                  <div className="my-6 flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-primary-500">{pkg.price}</span>
                    <span className="text-sm line-through text-slate-400">{pkg.oldPrice}</span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-6">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Full Blood Profile & Kidney Function</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Cardiac ECG & Lipid Panel</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Free Physician Consultation</span>
                    </li>
                  </ul>
                </div>

                <Link
                  to="/patient/book"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-xs text-center shadow transition-all hover:scale-102 active:scale-98"
                >
                  Book Package Online
                </Link>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-16 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-bold text-primary-500 uppercase tracking-widest">Help Center</span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <GlassCard key={idx} className="p-5 cursor-pointer hover:border-primary-500/40 transition-all" onClick={() => toggleFaq(idx)}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">{faq.q}</h3>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-primary-500' : ''}`} />
                </div>
                {openFaq === idx && (
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-200/40 dark:border-slate-800/40 pt-3 animate-fadeIn">
                    {faq.a}
                  </p>
                )}
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-primary-500 uppercase tracking-widest">Get In Touch</span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Contact & Location Information</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Reach out to our helpline or visit our super specialty hospital in Maharajganj.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard className="p-6 space-y-4 hover:-translate-y-1 transition-transform">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 w-fit">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Phone & Emergency</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">24/7 Ambulance Hotline & Desk</p>
              <a href="tel:+917985126471" className="font-extrabold text-sm text-primary-500 hover:underline block">
                +91 7985126471
              </a>
            </GlassCard>

            <GlassCard className="p-6 space-y-4 hover:-translate-y-1 transition-transform">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 w-fit">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Email Address</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Direct inquiries & online feedback</p>
              <a href="mailto:sandeepgaud8081@gmail.com" className="font-extrabold text-sm text-primary-500 hover:underline block">
                sandeepgaud8081@gmail.com
              </a>
            </GlassCard>

            <GlassCard className="p-6 space-y-4 hover:-translate-y-1 transition-transform">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 w-fit">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Hospital Campus</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Maharajganj, Gorakhpur Road, Uttar Pradesh - 273303</p>
              <a href="https://maps.app.goo.gl/ZZp8FjTLGhQoDEJP7" target="_blank" rel="noreferrer" className="font-extrabold text-xs text-emerald-500 hover:underline flex items-center space-x-1">
                <span>View on Google Maps</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white">
              <Building2 className="w-5 h-5 text-primary-500" />
              <span className="font-black text-base">SANDEEP HOSPITAL</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Maharajganj, Gorakhpur Road, UP - 273303. NABH Accredited Super Specialty Hospital delivering specialized healthcare, robotic surgical interventions, and AI diagnostics.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#departments" className="hover:text-white transition-colors">Departments</a></li>
              <li><a href="#gallery" className="hover:text-white transition-colors">Hospital Infrastructure</a></li>
              <li><a href="#doctors" className="hover:text-white transition-colors">Find a Doctor</a></li>
              <li><a href="#packages" className="hover:text-white transition-colors">Health Packages</a></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Patient Portal Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Departments</h4>
            <ul className="space-y-2 text-[11px]">
              <li>Cardiology & Cardiac Surgery</li>
              <li>Neurology & Spine Care</li>
              <li>Orthopedics & Joint Care</li>
              <li>Radiology & 3T MRI Diagnostics</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Emergency Hotline</h4>
            <div className="space-y-2">
              <p className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
                <Phone className="w-4 h-4" />
                <span>+91 7985126471</span>
              </p>
              <p className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>sandeepgaud8081@gmail.com</span>
              </p>
              <p className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Maharajganj, Gorakhpur Road, UP</span>
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 pt-6 text-center text-[10px] text-slate-500">
          © 2026 Sandeep Super Specialty Hospital Management System. Built by Er. Sandeep Gaud with MERN Stack & Gemini AI. All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
