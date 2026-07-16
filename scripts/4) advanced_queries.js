print("\n===============================")
print("1️⃣ Top 10 Best Rated Restaurants")
print("===============================\n")
// db.restaurants.find(...) Searches for documents in the restaurants collection.
// Filter { score: { $ne: null } } Selects only documents where the score field is not null ($ne = not equal).
// Projection { name: 1, score: 1, ratings: 1, category: 1 } Returns only the name, score, ratings, and category fields. The 1 means "include this field".
// .sort({ score: -1, ratings: -1 }) Sorts the results first by score in descending order (-1 = highest to lowest). If there is a tie in score, it uses ratings, also in descending order, as a secondary criterion.
// .forEach(printjson) Iterates over each document in the result and prints it in JSON format to the console.db.restaurants.find(
  { score: { $ne: null } },
  { name: 1, score: 1, ratings: 1, category: 1 }
)
.sort({ score: -1, ratings: -1 })
.limit(10)
.forEach(printjson)


print("\n==============================")
print("2️⃣ Restaurants with the most reviews")
print("==============================\n")

db.restaurants.find(
  { ratings: { $ne: null } },
  { name: 1, ratings: 1, score: 1 }
)
.sort({ ratings: -1 })
.limit(10)
.forEach(printjson)


print("\n==============================")
print("3️⃣ High-priced restaurants")
print("===============================\n")

// Filter { price_range: "$$$" } Selects only documents where the price_range field is exactly the string "$$$". This field typically represents the restaurant's price level (e.g., $, $$, $$$, $$$$).
db.restaurants.find(
  { price_range: "$$$" },
  { name: 1, price_range: 1, score: 1 }
)
.forEach(printjson)


print("\n==============================")
print("4️⃣ Restaurants with a score greater than 4.5")
print("==============================\n")

// Filter { score: { $gte: 4.5 } } Selects only documents where the score field is greater than or equal to 4.5.
db.restaurants.find(
  { score: { $gte: 4.5 } },
  { name: 1, score: 1, ratings: 1 }
)
.sort({ score: -1 })
.forEach(printjson)


print("\n==============================")
print("5️⃣ Sushi Restaurants")
print("==============================\n")

// /Sushi/i is a regular expression: /Sushi/ → searches for the word "Sushi" within the field. i → means case-insensitive (ignores uppercase/lowercase letters).
db.restaurants.find(
  { category: /Sushi/i },
  { name: 1, category: 1, score: 1 }
)
.forEach(printjson)


print("\n==============================")
print("6️⃣ Vegetarian restaurants")
print("==============================\n")

db.restaurants.find(
  { category: /Vegetarian/i },
  { name: 1, category: 1, score: 1 }
)
.forEach(printjson)


print("\n==============================")
print("7️⃣ Restaurant Count by Price Range")
print("===============================\n")

// db.restaurants.aggregate([...]) Executes an aggregation pipeline on the restaurants collection.
printjson(
  db.restaurants.aggregate([
    {
      // Groups documents by the price_range field.
      // Groups documents by the price_range field. For each group, creates a total field that counts how many documents are in that price range ($sum: 1).
      $group: {
        _id: "$price_range",
        total: { $sum: 1 }
      }
    },
    // Sorts the groups by the total field in descending order (-1 = from largest to smallest).
    { $sort: { total: -1 } }
    // .toArray() Converts the result into an array of documents so that it can be printed.
  ]).toArray()
)


print("\n==============================")
print("8️⃣ Average score by price range")
print("==============================\n")

printjson(
  db.restaurants.aggregate([
    // $match: { score: { $ne: null } } Filters documents from the restaurants collection. Only those with a score field other than null are passed to the pipeline.
    { $match: { score: { $ne: null } } },
    {
      //Groups documents by the price_range field.
      //_id: "$price_range" → the group identifier is the price range.
      //avg_score: { $avg: "$score" } → calculates the average rating of restaurants in that range.
      //total: { $sum: 1 } → counts how many restaurants are in that range.
      $group: {
        _id: "$price_range",
        avg_score: { $avg: "$score" },
        total: { $sum: 1 }
      }
    },
    // The price ranges with the best average rating appear first.
    { $sort: { avg_score: -1 } }
  ]).toArray()
)


print("\n==============================")
print("9️⃣ Average score per ZIP code")
print("=============================\n")

printjson(
  db.restaurants.aggregate([
    { $match: { score: { $ne: null } } },
    {
      $group: {
        _id: "$address.zip_code", // ✅ FIX
        avg_score: { $avg: "$score" },
        restaurants: { $sum: 1 }
      }
    },
    { $sort: { avg_score: -1 } }
  ]).toArray()
)
  

print("\n==============================")
print("🔟 Top 10 Restaurant Categories")
print("==============================\n")

printjson(
  db.restaurants.aggregate([
    // Main function: Takes a field that is an array and converts it into multiple documents, one for each element of the array.
    // In this case: The `category` field is an array (for example: ["Sushi", "Japanese", "Seafood"]).
    // With `$unwind: "$category`, MongoDB generates a separate document for each value in the array.
    { $unwind: "$category" }, // ✅ FIX
    {
      $group: {
        _id: "$category",
        total: { $sum: 1 }
      }
    },
    { $sort: { total: -1 } },
    { $limit: 10 }
  ]).toArray()
)