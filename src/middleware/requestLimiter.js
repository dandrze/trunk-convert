import Request from "../models/request.model.js";

export const limitRequests = async (req, res, next) => {
  // For simplicity we are using the servers time zone rather than users time zone
  // In a real world scenario we would likely chose to use the users time zone
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const dayOfWeek = todayStart.getDay();
  const requestsCount = await Request.countDocuments({
    user: req.user,
    createdAt: { $gt: todayStart },
  });

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const requestLimit = isWeekend
    ? process.env.REQUEST_LIMIT_WEEKEND
    : process.env.REQUEST_LIMIT_WEEKDAY;

  if (requestsCount >= requestLimit) {
    res.status(429).json({
      message: "Request limit exceeded for today.",
    });
    return;
  }

  next();
};
