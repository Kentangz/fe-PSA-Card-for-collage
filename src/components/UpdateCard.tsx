import axiosInstance from "../lib/axiosInstance";
import type { FormEvent } from "react";

// Type definition
type LatestStatus = {
  status: string;
};

type CardType = {
  id: string | number;
  latest_status: LatestStatus;
};

export default function UpdateCard({ card }: { card?: CardType }) {

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const grade = formData.get("grade");

    try {
      const response = await axiosInstance.put(`/card/${card?.id}`, { grade });
      if (response.status === 200) {
        await handleUpdateSubmission("done");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateSubmission = async (status: string) => {
    try {
      const response = await axiosInstance.post("/status", { 
        card_id: card?.id, 
        status: status 
      });
      if (response.status === 200) {
        window.location.reload(); 
        // navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 sm:p-4 lg:p-6">
      {card?.latest_status.status === "submitted" && (
        <div>
          <p className="text-blue-600 mb-3 lg:mb-4 font-medium text-sm sm:text-base">Accept this submission?</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button 
              onClick={() => handleUpdateSubmission("accepted")} 
              className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-2 lg:px-4 lg:py-2.5 border border-green-300 rounded cursor-pointer transition-colors font-medium text-sm sm:text-base w-full sm:w-auto"
            >
              Accept
            </button>
            <button 
              onClick={() => handleUpdateSubmission("rejected")}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 lg:px-4 lg:py-2.5 border border-red-300 rounded cursor-pointer transition-colors font-medium text-sm sm:text-base w-full sm:w-auto"
            >
              Reject
            </button>
          </div>
        </div>
      )}
      
      {card?.latest_status.status === "accepted" && (
        <div>
          <p className="text-blue-600 mb-3 lg:mb-4 font-medium text-sm sm:text-base">Continue to process?</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button 
              onClick={() => handleUpdateSubmission("on process")} 
              className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-2 lg:px-4 lg:py-2.5 border border-green-300 rounded cursor-pointer transition-colors font-medium text-sm sm:text-base w-full sm:w-auto"
            >
              Process
            </button>
            <button 
              onClick={() => handleUpdateSubmission("rejected")}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 lg:px-4 lg:py-2.5 border border-red-300 rounded cursor-pointer transition-colors font-medium text-sm sm:text-base w-full sm:w-auto"
            >
              Reject
            </button>
          </div>
        </div>
      )}
      
      {card?.latest_status.status === "on process" && (
        <div>
          <h5 className="text-base sm:text-lg lg:text-xl font-medium mb-3 lg:mb-4 text-gray-800">Set Final Grade</h5>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 lg:gap-3">
              <select 
                name="grade" 
                className="h-10 lg:h-12 px-3 lg:px-4 border border-gray-300 rounded bg-white text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base w-full sm:w-auto min-w-0 sm:min-w-[140px]"
                required
              >
                <option value="" className="text-gray-500">Select Grade</option>
                <option value="A" className="text-gray-800">Grade A</option>
                <option value="B" className="text-gray-800">Grade B</option>
                <option value="C" className="text-gray-800">Grade C</option>
              </select>
              <button 
                type="submit" 
                className="px-4 py-2 lg:px-6 lg:py-3 bg-green-500 hover:bg-green-600 text-white rounded cursor-pointer transition-colors font-medium text-sm sm:text-base w-full sm:w-auto"
              >
                Complete
              </button>
            </div>
          </form>
        </div>
      )}
      
      {card?.latest_status.status === "done" && (
        <div className="text-center py-4 lg:py-6">
          <div className="inline-flex items-center px-3 py-2 lg:px-4 lg:py-3 bg-green-100 border border-green-300 rounded-lg">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800 font-medium text-sm sm:text-base">Submission Completed</span>
          </div>
        </div>
      )}
      
      {card?.latest_status.status === "rejected" && (
        <div className="text-center py-4 lg:py-6">
          <div className="inline-flex items-center px-3 py-2 lg:px-4 lg:py-3 bg-red-100 border border-red-300 rounded-lg">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className="text-red-800 font-medium text-sm sm:text-base">Submission Rejected</span>
          </div>
        </div>
      )}
    </div>
  );
}