import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const faqData = [
    {
      question: "How do I submit an item for grading?",
      answer: "Simply create an account, choose your service level, and fill out the online submission form. Then ship your item to PSA. Our team will handle the rest."
    },
    {
      question: "What types of items does PSA grade?",
      answer: "PSA grades trading cards, autographs, tickets, and other collectible items. We specialize in sports cards, Pokémon cards, and other trading card games."
    },
    {
      question: "How long does the grading process take?",
      answer: "Grading times vary depending on the service level you choose. Economy service typically takes 60-90 business days, while Express service takes 10-15 business days."
    },
    {
      question: "How can I verify my PSA-graded item?",
      answer: "Every PSA-graded item comes with a unique certification number. You can verify authenticity by entering this number on our website's verification page."
    },
    {
      question: "What is a Population Report?",
      answer: "A Population Report shows how many cards of a particular type and grade PSA has authenticated. It helps collectors understand the rarity and value of their graded items."
    },
    {
      question: "Can I sell my graded cards directly through PSA?",
      answer: "PSA doesn't directly sell cards, but we partner with various auction houses and marketplaces. You can also use our Set Registry and Population Report data to help value your collection."
    }
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div id='faq' className="max-w-4xl mx-auto px-6 py-16 bg-gray-50">
      <div className="text-center mb-12">
        <h2 className="text-4xl text-gray-900 mb-4" style={{ fontFamily: 'Inter Tight, sans-serif', fontWeight: 500 }}>
          Clear Answers to your Questions, Ensuring a<br />
          Smooth Design Journey
        </h2>
      </div>

      <div className="space-y-4">
        {faqData.map((item, index) => (
          <div
            key={index}
            className={`rounded-2xl transition-all duration-300 ${
              openIndex === index 
                ? 'text-white' 
                : 'bg-white border border-gray-200 hover:border-gray-300'
            }`}
            style={openIndex === index ? { backgroundColor: '#1F1243' } : {}}
          >
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
            >
              <span 
                className={`text-lg font-semibold ${
                  openIndex === index ? 'text-white' : 'text-gray-900'
                }`}
                style={{ fontFamily: 'Inter Tight, sans-serif' }}
              >
                {index + 1}. {item.question}
              </span>
              <div className={`flex-shrink-0 ml-4 p-2 rounded-full ${
                openIndex === index 
                  ? 'bg-orange-400 text-white' 
                  : 'bg-gray-900 text-white'
              }`}>
                {openIndex === index ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>
            
            {openIndex === index && (
              <div className="px-6 pb-5">
                <p 
                  className="text-gray-200 leading-relaxed"
                  style={{ fontFamily: 'Inter Tight, sans-serif' }}
                >
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faq;