import { getStatusDisplayText, getStatusStyling } from "@/utils/statusUtils";

type Props = {
  status: string;
  includeBorder?: boolean;
  className?: string;
};

const StatusBadge: React.FC<Props> = ({ status, includeBorder = true, className }) => {
  const displayText = getStatusDisplayText(status);
  const styling = getStatusStyling(status, includeBorder);
  return (
    <span className={["inline-flex px-2 py-1 text-xs font-medium rounded-full", styling, className].filter(Boolean).join(" ")}>{displayText}</span>
  );
};

export default StatusBadge;


