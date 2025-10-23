import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Check, ArrowRight } from 'lucide-react';

const TutorialPage = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const steps = [
        {
            icon: Calendar,
            title: "Chọn khung thời gian",
            description: "Bắt đầu bằng cách chọn ngày và khung giờ bạn muốn lên lịch",
            image: "calendar",
            color: "bg-blue-50"
        },
        {
            icon: Plus,
            title: "Thêm môn học",
            description: "Nhấn nút thêm để tạo một môn học mới vào thời khóa biểu",
            image: "add",
            color: "bg-green-50"
        },
        {
            icon: Clock,
            title: "Điều chỉnh thời gian",
            description: "Kéo thả để thay đổi thời gian hoặc kéo dài thời lượng môn học",
            image: "adjust",
            color: "bg-purple-50"
        },
        {
            icon: Check,
            title: "Hoàn thành",
            description: "Lưu thời khóa biểu và bắt đầu sử dụng ngay",
            image: "done",
            color: "bg-gray-50"
        }
    ];

    const ScheduleIllustration = ({ type }) => {
        switch(type) {
            case "calendar":
                return (
                    <div className="relative w-full h-48 flex items-center justify-center">
                        <div className="grid grid-cols-7 gap-2 w-56">
                            {[...Array(21)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-8 rounded transition-all duration-700 ${
                                        i === 10 ? 'bg-blue-500 scale-110' : 'bg-gray-200'
                                    }`}
                                    style={{
                                        animationDelay: `${i * 50}ms`,
                                        animation: 'fadeIn 0.5s ease-in-out forwards'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                );
            case "add":
                return (
                    <div className="relative w-full h-48 flex items-center justify-center">
                        <div className="relative">
                            <div className="w-48 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                                    <Plus className="text-white" size={24} />
                                </div>
                            </div>
                            <div
                                className="absolute top-4 right-4 w-32 h-20 bg-green-100 rounded-lg border-2 border-green-500 opacity-0"
                                style={{
                                    animation: 'slideIn 1s ease-out 0.5s forwards'
                                }}
                            />
                        </div>
                    </div>
                );
            case "adjust":
                return (
                    <div className="relative w-full h-48 flex items-center justify-center">
                        <div className="space-y-3 w-56">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className={`h-12 rounded-lg transition-all duration-1000 ${
                                        i === 2 ? 'bg-purple-500 w-full' : 'bg-gray-200 w-40'
                                    }`}
                                    style={{
                                        animation: i === 2 ? 'expand 2s ease-in-out infinite' : 'none'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                );
            case "done":
                return (
                    <div className="relative w-full h-48 flex items-center justify-center">
                        <div className="relative">
                            <div className="w-48 h-32 bg-gray-100 rounded-lg grid grid-cols-3 gap-2 p-3">
                                {[...Array(6)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="bg-gray-300 rounded"
                                        style={{
                                            animation: `fadeIn 0.5s ease-in-out ${i * 0.1}s forwards`,
                                            opacity: 0
                                        }}
                                    />
                                ))}
                            </div>
                            <div
                                className="absolute -top-2 -right-2 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center opacity-0"
                                style={{
                                    animation: 'checkmark 0.6s ease-out 0.8s forwards'
                                }}
                            >
                                <Check className="text-white" size={32} />
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes expand {
          0%, 100% { width: 10rem; }
          50% { width: 14rem; }
        }
        @keyframes checkmark {
          0% { opacity: 0; transform: scale(0) rotate(-45deg); }
          50% { transform: scale(1.2) rotate(10deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
      `}</style>

            <div className={`max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-light text-gray-800 mb-4">
                        Hướng dẫn sử dụng
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Xếp thời khóa biểu dễ dàng chỉ với 4 bước đơn giản
                    </p>
                </div>

                {/* Steps */}
                <div className="space-y-8">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = currentStep === index;

                        return (
                            <div
                                key={index}
                                className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-500 ${
                                    isActive ? 'scale-105 shadow-lg' : 'hover:shadow-md'
                                }`}
                                onMouseEnter={() => setCurrentStep(index)}
                            >
                                <div className="flex flex-col md:flex-row">
                                    {/* Content */}
                                    <div className="flex-1 p-8">
                                        <div className="flex items-start space-x-4">
                                            <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                                                <Icon className="text-gray-700" size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm font-medium text-gray-400">
                            Bước {index + 1}
                          </span>
                                                    {isActive && (
                                                        <ArrowRight className="text-gray-400 animate-pulse" size={16} />
                                                    )}
                                                </div>
                                                <h3 className="text-2xl font-light text-gray-800 mb-3">
                                                    {step.title}
                                                </h3>
                                                <p className="text-gray-600 leading-relaxed">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Illustration */}
                                    <div className={`w-full md:w-80 ${step.color} p-8 flex items-center justify-center transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                                        <ScheduleIllustration type={step.image} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Progress Indicator */}
                <div className="flex justify-center items-center space-x-2 mt-12">
                    {steps.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentStep(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                currentStep === index ? 'w-8 bg-gray-700' : 'w-2 bg-gray-300'
                            }`}
                        />
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-16">
                    <button className="px-8 py-3 bg-gray-800 text-white rounded-full hover:bg-gray-900 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                        Bắt đầu ngay
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TutorialPage;