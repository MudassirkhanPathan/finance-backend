const Record = require("../models/record.model");

const getSummary = async (query) => {
  try {
    let { from, to } = query;

    //   Default dates
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const fromDate = from ? new Date(from) : startOfMonth;
    const toDate = to ? new Date(to) : today;

    if (isNaN(fromDate) || isNaN(toDate)) {
      return {
        status: false,
        statusCode: 400,
        error: "Invalid date format",
      };
    }

    //   Aggregation
    const result = await Record.aggregate([
      {
        $match: {
          is_deleted: false,
          date: {
            $gte: fromDate,
            $lte: toDate,
          },
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    let total_income = 0;
    let total_expense = 0;

    result.forEach((item) => {
      if (item._id === "income") total_income = item.total;
      if (item._id === "expense") total_expense = item.total;
    });

    const net_balance = total_income - total_expense;

    return {
      status: true,
      statusCode: 200,
      data: {
        total_income,
        total_expense,
        net_balance,
      },
    };
  } catch (error) {
    console.error("Dashboard Service Error:", error.message);
    throw error;
  }
};

const getCategoryBreakdown = async (query) => {
  try {
    let { from, to } = query;

    //  Default dates
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const fromDate = from ? new Date(from) : startOfMonth;
    const toDate = to ? new Date(to) : today;

    if (isNaN(fromDate) || isNaN(toDate)) {
      return {
        status: false,
        statusCode: 400,
        error: "Invalid date format",
      };
    }

    //   Aggregation with JOIN
    const result = await Record.aggregate([
      {
        $match: {
          is_deleted: false,
          date: {
            $gte: fromDate,
            $lte: toDate,
          },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $group: {
          _id: "$category.name",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          total: 1,
          count: 1,
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    return {
      status: true,
      statusCode: 200,
      data: result,
    };
  } catch (error) {
    console.error("Category Breakdown Service Error:", error.message);
    throw error;
  }
};

const getMonthlyTrends = async (query) => {
  try {
    let { year } = query;

    const currentYear = new Date().getFullYear();
    year = year ? parseInt(year) : currentYear;

    if (isNaN(year)) {
      return {
        status: false,
        statusCode: 400,
        error: "Invalid year",
      };
    }

    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    //   Aggregation
    const result = await Record.aggregate([
      {
        $match: {
          is_deleted: false,
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
    ]);

    //   Transform into month-wise structure
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
      net: 0,
    }));

    result.forEach((item) => {
      const m = item._id.month - 1;

      if (item._id.type === "income") {
        months[m].income = item.total;
      } else {
        months[m].expense = item.total;
      }
    });

    //   Calculate net
    months.forEach((m) => {
      m.net = m.income - m.expense;
    });

    return {
      status: true,
      statusCode: 200,
      data: months,
    };
  } catch (error) {
    console.error("Monthly Trends Service Error:", error.message);
    throw error;
  }
};

const getWeeklyTrends = async (query) => {
  try {
    let { month, year } = query;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    month = month ? parseInt(month) : currentMonth;
    year = year ? parseInt(year) : currentYear;

    if (isNaN(month) || month < 1 || month > 12) {
      return {
        status: false,
        statusCode: 400,
        error: "Invalid month",
      };
    }

    if (isNaN(year)) {
      return {
        status: false,
        statusCode: 400,
        error: "Invalid year",
      };
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    //   Aggregation (week of month)
    const result = await Record.aggregate([
      {
        $match: {
          is_deleted: false,
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $project: {
          amount: 1,
          type: 1,
          week: {
            $ceil: {
              $divide: [{ $dayOfMonth: "$date" }, 7],
            },
          },
        },
      },
      {
        $group: {
          _id: {
            week: "$week",
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
    ]);

    //   Format into 4–5 weeks
    const weeks = [];

    for (let i = 1; i <= 5; i++) {
      weeks.push({
        week: i,
        income: 0,
        expense: 0,
      });
    }

    result.forEach((item) => {
      const w = item._id.week - 1;

      if (item._id.type === "income") {
        weeks[w].income = item.total;
      } else {
        weeks[w].expense = item.total;
      }
    });

    return {
      status: true,
      statusCode: 200,
      data: weeks,
    };
  } catch (error) {
    console.error("Weekly Trends Service Error:", error.message);
    throw error;
  }
};

const getRecentTransactions = async () => {
  try {
    const records = await Record.find({
      is_deleted: false,
    })
      .populate("category_id", "name")
      .sort({ date: -1 })
      .limit(10);

    //   Format response
    const formatted = records.map((r) => ({
      id: r._id,
      amount: r.amount,
      type: r.type,
      category: r.category_id?.name || null,
      date: r.date,
    }));

    return {
      status: true,
      statusCode: 200,
      data: formatted,
    };
  } catch (error) {
    console.error("Recent Transactions Service Error:", error.message);
    throw error;
  }
};

const getBalanceOverTime = async (query) => {
  try {
    let { from, to, interval = "daily" } = query;

    const today = new Date();
    const startDefault = new Date(today.getFullYear(), today.getMonth(), 1);

    const fromDate = from ? new Date(from) : startDefault;
    const toDate = to ? new Date(to) : today;

    if (isNaN(fromDate) || isNaN(toDate)) {
      return {
        status: false,
        statusCode: 400,
        error: "Invalid date format",
      };
    }

    if (!["daily", "weekly", "monthly"].includes(interval)) {
      return {
        status: false,
        statusCode: 400,
        error: "Invalid interval",
      };
    }
    const records = await Record.find({
      is_deleted: false,
      date: { $gte: fromDate, $lte: toDate },
    }).sort({ date: 1 });

    //   Running balance
    let balance = 0;
    const points = [];

    records.forEach((r) => {
      if (r.type === "income") {
        balance += r.amount;
      } else {
        balance -= r.amount;
      }

      points.push({
        date: r.date,
        balance,
      });
    });

    return {
      status: true,
      statusCode: 200,
      data: points,
    };
  } catch (error) {
    console.error("Balance Over Time Service Error:", error.message);
    throw error;
  }
};

const getTopCategories = async (query) => {
  try {
    let { from, to } = query;

    const today = new Date();
    const startDefault = new Date(today.getFullYear(), today.getMonth(), 1);

    const fromDate = from ? new Date(from) : startDefault;
    const toDate = to ? new Date(to) : today;

    if (isNaN(fromDate) || isNaN(toDate)) {
      return {
        status: false,
        statusCode: 400,
        error: "Invalid date format",
      };
    }

    //   Aggregation
    const result = await Record.aggregate([
      {
        $match: {
          is_deleted: false,
          date: {
            $gte: fromDate,
            $lte: toDate,
          },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category.name",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]);

    //   Total sum for percentage
    const totalSum = result.reduce((acc, curr) => acc + curr.total, 0);

    const formatted = result.map((item) => ({
      category: item._id,
      total: item.total,
      percentage: totalSum
        ? Number(((item.total / totalSum) * 100).toFixed(2))
        : 0,
    }));

    return {
      status: true,
      statusCode: 200,
      data: formatted,
    };
  } catch (error) {
    console.error("Top Categories Service Error:", error.message);
    throw error;
  }
};

module.exports = {
  getSummary,
  getTopCategories,
  getMonthlyTrends,
  getBalanceOverTime,
  getRecentTransactions,
  getWeeklyTrends,
  getCategoryBreakdown,
};
