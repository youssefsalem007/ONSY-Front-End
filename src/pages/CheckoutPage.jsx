import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const plans = [
  { id: 'tier1', name: '1 Month Free Trial', price: '$0', desc: 'Perfect for getting started' },
  { id: 'tier2', name: '3 Months Subscription', price: '$29.99', desc: 'Billed quarterly' },
  { id: 'tier3', name: '1 Year Subscription', price: '$99.99', desc: 'Best value, billed annually' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('tier1');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', cardNumber: '', expiry: '', cvv: '' });

  // If the user has already completed payment, skip directly to EEG Analysis
  useEffect(() => {
    const checkPayment = () => {
      try {
        const tokenString = localStorage.getItem('payment_token');
        if (!tokenString) return false;
        const tokenData = JSON.parse(tokenString);
        if (tokenData && tokenData.expiry && Date.now() < tokenData.expiry) {
          return true;
        }
        return false;
      } catch (err) {
        return false;
      }
    };

    if (checkPayment()) {
      navigate('/EEGAnalysis', { replace: true });
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePayment = (e) => {
    e.preventDefault();
    if (!form.name || !form.cardNumber || !form.expiry || !form.cvv) {
      toast.error('Please fill in all payment details.');
      return;
    }

    const [month, year] = form.expiry.split('/');
    if (!month || !year || month < 1 || month > 12) {
      toast.error('Invalid expiry format. Use MM/YY.');
      return;
    }

    const currentDate = new Date();
    const currentYear = parseInt(currentDate.getFullYear().toString().slice(-2), 10);
    const currentMonth = currentDate.getMonth() + 1; // 1-12

    const expYear = parseInt(year, 10);
    const expMonth = parseInt(month, 10);

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      toast.error('Expiry date cannot be in the past.');
      return;
    }
    
    setLoading(true);
    // Simulate processing
    setTimeout(() => {
      setLoading(false);
      
      // Calculate expiration based on selected plan
      const now = Date.now();
      let days = 30; // default to 1 month (tier1)
      if (selectedPlan === 'tier2') days = 90; // 3 months
      else if (selectedPlan === 'tier3') days = 365; // 1 year
      
      const expiry = now + (days * 24 * 60 * 60 * 1000);
      
      // Persist payment token so this page is skipped on future visits
      localStorage.setItem('payment_token', JSON.stringify({ expiry, plan: selectedPlan }));
      toast.success('Payment successful!');
      navigate('/EEGAnalysis');
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white pt-28 pb-16 px-6 transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Plans */}
        <div className="flex flex-col gap-6">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black mb-2"
          >
            Select a Plan
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 mb-4"
          >
            Choose the subscription that fits your needs to get early access.
          </motion.p>
          
          <div className="flex flex-col gap-4">
            {plans.map((plan, i) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  onClick={() => setSelectedPlan(plan.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-between
                    ${isSelected 
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 shadow-md' 
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-teal-300 dark:hover:border-teal-700/50'
                    }
                  `}
                >
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-50">{plan.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{plan.desc}</p>
                  </div>
                  <div className="text-2xl font-black text-teal-600 dark:text-teal-400">
                    {plan.price}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right: Payment Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl"
        >
          <h2 className="text-2xl font-bold mb-6">Payment Details</h2>
          <form onSubmit={handlePayment} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cardholder Name</label>
              <input 
                type="text" 
                name="name" 
                value={form.name} 
                onChange={handleInputChange} 
                placeholder="John Doe"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-teal-500 dark:focus:border-teal-500 transition-colors"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Card Number</label>
              <input 
                type="text" 
                name="cardNumber" 
                value={form.cardNumber} 
                onChange={handleInputChange} 
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-teal-500 dark:focus:border-teal-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Expiry Date</label>
                <input 
                  type="text" 
                  name="expiry" 
                  value={form.expiry} 
                  onChange={handleInputChange} 
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-teal-500 dark:focus:border-teal-500 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">CVV</label>
                <input 
                  type="text" 
                  name="cvv" 
                  value={form.cvv} 
                  onChange={handleInputChange} 
                  placeholder="123"
                  maxLength={4}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-teal-500 dark:focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-lg font-bold">
              <span>Total to Pay</span>
              <span className="text-teal-600 dark:text-teal-400">
                {plans.find(p => p.id === selectedPlan)?.price}
              </span>
            </div>

            <motion.button 
              whileHover={!loading ? { y: -2, scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white mt-4 flex justify-center items-center gap-2 transition-all duration-300 ${
                loading 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-teal-600 to-cyan-500 shadow-lg shadow-teal-300/50 dark:shadow-teal-900/50 hover:shadow-xl'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                'Pay & Access'
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
