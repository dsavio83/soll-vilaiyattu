import React from 'react';
import { X, BookOpen } from 'lucide-react';

interface GameRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GameRulesModal = ({ isOpen, onClose }: GameRulesModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6" />
              <h6 className="text-xl font-bold" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                விளையாட்டு விதி
              </h6>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-justify">
                கொடுக்கப்பட்டிருக்கும் 7 எழுத்துகளில் மறைந்திருக்கும் அதிகபட்ச சொற்களைக் கண்டுபிடிப்பதே 'வார்த்தையோடு விளையாடு'.
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
              <p className="text-justify">
                இதில் முக்கியமான சவால், நீங்கள் கண்டுபிடிக்கும் அனைத்து வார்த்தைகளும், நடு எழுத்தைக் கட்டாயம் கொண்டிருக்க வேண்டும்.
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <p className="text-justify">
                மற்றொரு சவால், கொடுக்கப்பட்டிருக்கும் அனைத்து எழுத்துகளும் சேர்ந்து வரும் அந்த ஒற்றை சொல்லையும் கண்டுபிடிக்க வேண்டும்.
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p className="text-justify">
                நீங்கள் கண்டுபிடிக்க வேண்டிய வார்த்தைகள் எவ்வளவு என்பதையும், அவை எத்தனை எழுத்து என்பதையும் அருகில் இருக்கும் கட்டங்களை அல்லது View Words பட்டனைச் சொடுக்கி யூகிக்கலாம்.
              </p>
            </div>

            <div className="bg-teal-50 p-4 rounded-lg border-l-4 border-teal-500">
              <p className="text-justify">
                கட்டங்கள் அனைத்தையும் முடித்துவிட்டாலே நீங்க வின்னர்தான்!
              </p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
              <p className="text-justify">
                எவ்வளவு யூகித்தும் விடை கண்டுபிடிக்க முடியவில்லையா? அடுத்த நாள், Yesterday Answer பகுதிக்குச் சென்று விடைகளைத் தெரிந்துகொள்ளலாம்.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
          >
            புரிந்துகொண்டேன்
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameRulesModal;