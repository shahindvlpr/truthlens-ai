import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiShield, FiBarChart2, FiGlobe, FiZap, FiTrendingUp, 
  FiAward, FiUsers, FiClock, FiCheckCircle, FiArrowRight,
  FiStar, FiMessageCircle, FiLock
} from 'react-icons/fi';
import { FaRobot, FaBrain, FaChartLine } from 'react-icons/fa';
import GradientText from '../../components/ui/GradientText';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const LandingPage = () => {
  const features = [
    { icon: <FiShield />, title: '94% Accuracy', desc: 'State-of-the-art ML model trained on 44k+ samples', color: 'from-blue-500 to-cyan-500' },
    { icon: <FiBarChart2 />, title: 'Real-time Analytics', desc: 'Track fake news trends instantly', color: 'from-purple-500 to-pink-500' },
    { icon: <FiGlobe />, title: 'Bangla + English', desc: 'Full support for both languages', color: 'from-green-500 to-emerald-500' },
    { icon: <FiZap />, title: 'Lightning Fast', desc: 'Results in under 2 seconds', color: 'from-orange-500 to-red-500' },
    { icon: <FiTrendingUp />, title: 'Trend Detection', desc: 'Identify emerging fake news patterns', color: 'from-indigo-500 to-blue-500' },
    { icon: <FiAward />, title: 'Premium Quality', desc: 'Trusted by thousands of users', color: 'from-yellow-500 to-amber-500' },
  ];

  const stats = [
    { value: '94%', label: 'Accuracy', icon: <FiCheckCircle /> },
    { value: '44K+', label: 'News Samples', icon: <FiStar /> },
    { value: '2K+', label: 'Active Users', icon: <FiUsers /> },
    { value: '<2s', label: 'Response Time', icon: <FiClock /> },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl opacity-20 animate-float delay-200"></div>
        
        <div className="relative container mx-auto px-4 py-20 z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <FiStar className="text-yellow-500" />
                <span className="text-sm font-medium">AI-Powered Fact Checking</span>
              </div>
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-5xl md:text-7xl font-bold mb-6">
              <GradientText>TruthLens AI</GradientText>
              <br />
              <span className="text-gray-800 dark:text-gray-100">See Through the</span>
              <span className="text-red-500"> Lies</span>
            </motion.h1>
            
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Detect fake news instantly with advanced AI. Supporting English & Bengali. 
              Trust but verify with TruthLens.
            </motion.p>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/register">
                <Button size="lg" className="group">
                  Get Started Free
                  <FiArrowRight className="inline ml-2 group-hover:translate-x-1 transition" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                  <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mt-1">
                    {stat.icon}
                    <span>{stat.label}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Why Choose <GradientText>TruthLens AI?</GradientText>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powered by cutting-edge machine learning to combat misinformation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center group cursor-pointer">
                  <div className={`p-4 rounded-2xl bg-gradient-to-r ${feature.color} w-16 h-16 flex items-center justify-center mx-auto -mt-8 shadow-lg group-hover:scale-110 transition`}>
                    <div className="text-white text-2xl">{feature.icon}</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              How It <GradientText>Works</GradientText>
            </h2>
            <p className="text-gray-600 dark:text-gray-300">Three simple steps to verify any news</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Paste News', desc: 'Copy and paste any news article or social media post', icon: '📝' },
              { step: '02', title: 'AI Analysis', desc: 'Our AI processes the text using advanced NLP', icon: '🤖' },
              { step: '03', title: 'Get Results', desc: 'Receive accuracy score and detailed explanation', icon: '🎯' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-3xl">{item.icon}</span>
                  </div>
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-10 -right-10 text-3xl text-gray-300">→</div>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Fight Misinformation?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust TruthLens AI for accurate news verification
          </p>
          <Link to="/register">
            <Button variant="secondary" size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Start Free Trial
              <FiArrowRight className="inline ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;