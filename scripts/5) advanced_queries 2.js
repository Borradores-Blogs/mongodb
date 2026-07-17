print("\n==============================")
print("1️⃣1️⃣ Restaurants with more than 50 reviews")
print("==============================\n")

db.restaurants.find(
  { ratings: { $gt: 50 } },
  { name: 1, ratings: 1, score: 1 }
)
.sort({ ratings: -1 })
.forEach(printjson)


print("\n==============================")
print("1️⃣2️⃣ Restaurants with few reviews but high scores")
print("==============================\n")

db.restaurants.find(
  {
    score: { $gte: 4.5 },
    ratings: { $lt: 10 }
  },
  { name: 1, score: 1, ratings: 1 }
)
.forEach(printjson)


print("\n==============================")
print("1️⃣3️⃣ Count of restaurants by category")
print("=============================\n")

printjson(
  db.restaurants.aggregate([
    { $unwind: "$category" }, // ✅ FIX
    {
      $group: {
        _id: "$category",
        total_restaurants: { $sum: 1 }
      }
    },
    { $sort: { total_restaurants: -1 } }
  ]).toArray()
)
