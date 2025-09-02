import { useNavigate } from "react-router-dom";
import { useCallback, useMemo } from "react";
import ProfileMenu from "@/components/ProfileMenu";
import UserDashboardStats from "@/components/UserDashboardStats";
import ActiveBatches from "@/components/ActiveBatches";
import SubmissionHistory from "@/components/SubmissionHistory";
import { useUserDashboard } from "@/hooks/useUserDashboard";
import { PATHS } from "@/routes/paths";
import UserLayout from "@/layouts/UserLayout";
import { ImHome } from "react-icons/im";
import { MdTrackChanges } from "react-icons/md";

const menu = [
  { title: "home", link: PATHS.DASHBOARD.USER.ROOT, icon: ImHome },
  { title: "track submission", link: PATHS.DASHBOARD.USER.TRACKING, icon: MdTrackChanges },
];

export default function DashboardUser() {
  const { currentUser, cards, activeBatches, loading } = useUserDashboard();
  const navigate = useNavigate();
  const memoMenu = useMemo(() => menu, []);
  const handleCreateSubmission = useCallback((batchId: number) => {
    navigate(`${PATHS.DASHBOARD.USER.SUBMISSIONS}?batch_id=${batchId}`);
  }, [navigate]);

  if (loading) {
    return (
      <UserLayout menu={memoMenu} isLoading title="Dashboard Overview" />
    );
  }

  return (
    <UserLayout
      menu={memoMenu}
      title="Dashboard Overview"
      navbarRight={<ProfileMenu currentUser={currentUser} />}
    >
      <UserDashboardStats summaryCards={cards} />
      <ActiveBatches 
        batches={activeBatches} 
        isLoading={loading}
        onCreateSubmission={handleCreateSubmission} 
      />
      <SubmissionHistory submissions={cards} />
    </UserLayout>
  );
}