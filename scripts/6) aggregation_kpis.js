print("\n======================================")
print("📊 KPI 1: Average Rating by Category")
print("========================================\n")

printjson(
  db.restaurants.aggregate([
    { $unwind: "$category" }, // ✅ FIX
    {
      $group: {
        _id: "$category",
        avg_rating: { $avg: "$score" },
        total_restaurants: { $sum: 1 }
      }
    },
    { $sort: { avg_rating: -1 } }
  ]).toArray()
)


print("\n======================================")
print("📊 KPI 2: Number of Restaurants by Price Range")
print("========================================\n")

printjson(
  db.restaurants.aggregate([
    {
      $group: {
        _id: "$price_range",
        total_restaurants: { $sum: 1 }
      }
    },
    { $sort: { total_restaurants: -1 } }
  ]).toArray()
)
