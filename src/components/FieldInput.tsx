import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

interface InputProps {
  type: 'email' | 'password' | 'text';
  placeholder: string;
  name: string;
  required?: boolean;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FieldInput: React.FC<InputProps> = ({
  type,
  placeholder,
  name,
  required = false,
  className = "",
  value,
  onChange
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  const getIcon = () => {
    switch (type) {
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'password':
        return <Lock className="w-5 h-5" />;
      default:
        return null;
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      {getIcon() && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {getIcon()}
        </div>
      )}
      
      <input
        type={inputType}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full ${getIcon() ? 'pl-10' : 'pl-4'} ${type === 'password' ? 'pr-12' : 'pr-4'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all`}
        placeholder={placeholder}
        required={required}
      />
      
      {type === 'password' && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
};

export default FieldInput;