import { CheckCircle, AlertCircle, X, LucideIcon } from 'lucide-react';

// Type definitions
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
}

export const Notification = ({ message, type, onClose }: NotificationProps) => {
  const getColorClasses = (notificationType: NotificationType) => {
    switch (notificationType) {
      case 'success':
        return {
          bgColor: 'bg-green-50',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          Icon: CheckCircle
        };
      case 'error':
        return {
          bgColor: 'bg-red-50',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          Icon: AlertCircle
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          Icon: AlertCircle
        };
      case 'info':
        return {
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          Icon: AlertCircle
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          Icon: AlertCircle
        };
    }
  };

  const { bgColor, textColor, borderColor, Icon } = getColorClasses(type);

  return (
    <div className={`${bgColor} ${borderColor} border rounded-lg p-4 mb-4`}>
      <div className="flex items-start">
        <Icon className={`w-5 h-5 ${textColor} mt-0.5 mr-3 flex-shrink-0`} />
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`ml-3 flex-shrink-0 ${textColor} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded`}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};