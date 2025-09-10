import { getBatchCategoryStyling } from "@/utils/statusUtils";

type Props = {
  category: string;
  className?: string;
};

const CategoryBadge: React.FC<Props> = ({ category, className }) => {
  const styling = getBatchCategoryStyling(category, true);
  return (
    <span className={["inline-flex px-2 py-1 text-xs font-medium rounded-full border", styling, className].filter(Boolean).join(" ")}>{category}</span>
  );
};

export default CategoryBadge;


