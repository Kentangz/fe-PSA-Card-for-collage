import { format, isToday, isYesterday } from "date-fns";

const formatDate = (dateParams: Date) => {
	const date = new Date(dateParams);

	if (isToday(date)) {
		return `${format(date, "HH:mm")}`;
	} else if (isYesterday(date)) {
		return `Yesterday ${format(date, "HH:mm")}`;
	} else {
		if (date.getFullYear() == new Date().getFullYear()) {
			return format(date, "MMM d");
		}
		return format(date, "MMM d, yyy");
	}
};

export default formatDate;
