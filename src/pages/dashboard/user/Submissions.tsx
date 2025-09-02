import ProfileMenu from "@/components/ProfileMenu";
import SubmissionForm from "@/components/SubmissionForm";
import BatchInfo from "@/components/BatchInfo";
import { useSubmissions } from "@/hooks/useSubmissions";
import UserLayout from "@/layouts/UserLayout";
import { PATHS } from "@/routes/paths";
import { ImHome } from "react-icons/im";
import { MdTrackChanges } from "react-icons/md";
import { HiOutlineClipboardList } from "react-icons/hi";

const menu = [
  {
    title: "home",
    link: PATHS.DASHBOARD.USER.ROOT,
    icon: ImHome
  },
  {
    title: "track submission",
    link: PATHS.DASHBOARD.USER.TRACKING,
    icon: MdTrackChanges
  },
];

export default function CreateSubmissionPage() {
  const {
    loading,
    isSubmitting,
    error,
    currentUser,
    selectedBatch,
    submissions,
    addSubmission,
    removeSubmission,
    updateForm,
    handleSubmitAll,
    handleBackToDashboard,
  } = useSubmissions();

  if (loading) {
    return (
      <UserLayout menu={menu} isLoading title="Create Submission" />
    );
  }

  return (
    <UserLayout
      menu={menu}
      title={`Create Submission${selectedBatch ? ` - ${selectedBatch.batch_number}` : ''}`}
      navbarRight={<ProfileMenu currentUser={currentUser} />}
    >
        <div className="space-y-4 sm:space-y-6">
          
          {selectedBatch ? (
            <BatchInfo 
              batch={selectedBatch} 
              onBackToDashboard={handleBackToDashboard}
              isSubmitting={isSubmitting}
            />
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8 text-center">
              <HiOutlineClipboardList className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 text-base">Batch not found or inactive.</p>
            </div>
          )}

          {selectedBatch && (
            <>
              <div className="flex justify-between items-center">
                <button
                  onClick={addSubmission}
                  disabled={isSubmitting}
                  className="bg-white hover:bg-gray-50 border border-gray-300 px-4 py-2.5 rounded-lg text-gray-700 font-medium transition-colors disabled:opacity-50"
                >
                  + Add More
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 text-sm font-medium rounded-lg p-3">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {submissions.map((data, index) => (
                  <div key={index} className="relative">
                    {submissions.length > 1 && (
                      <button
                        onClick={() => removeSubmission(index)}
                        disabled={isSubmitting}
                        className="absolute top-4 right-4 z-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-full w-7 h-7 flex items-center justify-center font-bold"
                      >
                        ×
                      </button>
                    )}
                    <SubmissionForm
                      index={index}
                      data={data}
                      onChange={updateForm}
                      disabled={isSubmitting}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={handleBackToDashboard}
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAll}
                  disabled={isSubmitting || submissions.length === 0}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {isSubmitting ? 'Submitting...' : `Submit All (${submissions.length})`}
                </button>
              </div>
            </>
          )}
        </div>
    </UserLayout>
  );
}