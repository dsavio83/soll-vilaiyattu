
import React, { useState, useEffect } from 'react';
import { mongodb } from '@/integrations/mongodb/client';
import { useToast } from '@/hooks/use-toast';

interface StudentLoginProps {
  onLogin: (student: any) => void;
}

const StudentLogin = ({ onLogin }: StudentLoginProps) => {
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Test database connection on component mount
  React.useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await mongodb
          .from('students')
          .limit(1);
        
        if (error) {
          console.error('Database connection test failed:', error);
        } else {
          console.log('Database connection successful');
        }
      } catch (err) {
        console.error('Database connection error:', err);
      }
    };
    
    testConnection();
  }, []);

  const handleLogin = async () => {
    if (!admissionNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter your admission number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    
    try {
      const { data, error } = await mongodb
        .from('students')
        .eq('admission_number', admissionNumber.trim())
        .single();

      if (error) {
        console.error('Database error:', error);
        toast({
          title: "Database Error",
          description: `Connection error: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      if (!data) {
        toast({
          title: "User Not Found",
          description: "Admission number not found. Please check your admission number or contact your teacher.",
          variant: "destructive"
        });
        return;
      }


      // Ensure _id is available for MongoDB operations
      const studentWithId = {
        ...data,
        _id: data._id || data.id || data.admission_number
      };
      onLogin(studentWithId);
      toast({
        title: "Welcome!",
        description: `Welcome ${data.name}!`,
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto px-4">
        
        
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          விளையாட்டில் சேர
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              சேர்க்கை எண் (Admission Number)
            </label>
            <input
              type="text"
              value={admissionNumber}
              onChange={(e) => setAdmissionNumber(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your admission number"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleLogin();
                }
              }}
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Start Game'}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
