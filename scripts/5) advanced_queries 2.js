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


print("\n==============================")
print("1️⃣4️⃣ Restaurants without score")
print("=============================\n")

db.restaurants.find(
  { score: null },
  { name: 1, category: 1 }
)
.forEach(printjson)


print("\n==============================")
print("1️⃣5️⃣ Restaurants without a price range")
print("==============================\n")

db.restaurants.find(
  { price_range: "" },
  { name: 1, category: 1 }
)
.forEach(printjson)


print("\n==============================")
print("1️⃣6️⃣ Average number of reviews per category")
print("==============================\n")

printjson(
  db.restaurants.aggregate([
    // $match: { ratings: { $ne: null } } Filters documents so that only those with a ratings field other than null are allowed.
    { $match: { ratings: { $ne: null } } },
    // $unwind: "$category" Breaks down the category array into multiple documents, one for each element.
    { $unwind: "$category" }, // ✅ FIX
    {
      $group: {
        _id: "$category",
        avg_ratings: { $avg: "$ratings" }
      }
    },
    { $sort: { avg_ratings: -1 } }
  ]).toArray()
)


print("\n==============================")
print("1️⃣7️⃣ Most Popular Restaurants by Category")
print("==============================\n")

printjson(
  db.restaurants.aggregate([
    { $unwind: "$category" }, // ✅ FIX
    { $sort: { ratings: -1 } },
    {
      $group: {
        _id: "$category",
        // `$first` is an accumulator in MongoDB that returns the first value of a field within each group.
        // The "first value" depends on the order of the documents in the pipeline before reaching `$group`.
        // In this case, just before `$group` there's `$sort: { ratings: -1 }`, which ensures that the first document in each category is the one with the highest rating.
        // `top_restaurant: { $first: "$name" }` Within each group (grouped by category), it takes the first restaurant name. Since the documents are already sorted by descending ratings, that first restaurant will be the highest-rated in the category.
        top_restaurant: { $first: "$name" },
        // max_ratings: { $first: "$ratings" } Returns the first rating value in each group. Since the order is already descending, this value corresponds to the highest rating in the category.
        max_ratings: { $first: "$ratings" }
      }
    },
    { $sort: { max_ratings: -1 } }
  ]).toArray()
)


print("\n==============================")
print("1️⃣8️⃣ Restaurants ordered by weighted popularity")
print("===============================\n")

// Build a restaurant popularity ranking
printjson(
  db.restaurants.aggregate([
    {
      // $addFields Adds a new calculated field called popularity_score. It is obtained by multiplying score and ratings.
      $addFields: {
        popularity_score: {$multiply: ["$score", "$ratings"]}
      }
    },
    { $sort: { popularity_score: -1 } },
    { $limit: 10 }
  ]).toArray()
)


print("\n==============================")
print("1️⃣9️⃣ Restaurants near a location")
print("==============================\n")

db.restaurants.find({
  // Filter location: { $near: { ... } }. Applies a filter on the location field, which must be a field with geospatial coordinates and have a previously created 2dsphere index.
  location: {
    // The $near operator returns documents ordered by proximity to a given point.
    $near: {
      // $geometry Defines the reference point in GeoJSON format. type: "Point" → indicates that it is a point. coordinates: [-86.80, 33.51] → longitude and latitude of the center point.
      $geometry: {
        type: "Point",
        coordinates: [-86.80, 33.51]
      },
      // $maxDistance: 3000 Limits the results to those whose location is within a radius of 3000 meters (3 km) from the given point.
      $maxDistance: 3000
    }
  }
})
.forEach(printjson)


print("\n==============================")
print("20 Restaurants within a geographic radius")
print("===============================\n")

// This pipeline uses $geoNear to find the restaurants closest to a geographic point, adds a distance field with the calculated distance in meters, and returns the first 10 results ordered by proximity.
printjson(
  db.restaurants.aggregate([
    {
      // $geoNear is a special aggregation stage that can only go at the beginning of the pipeline. It searches for documents near a geographic point.
      $geoNear: {
        // near: { type: "Point", coordinates: [-86.80, 33.51] } Defines the reference point in GeoJSON format.
        near: {
          type: "Point",
          coordinates: [-86.80, 33.51]
        },
        // distanceField: "distance" Creates an additional field in each document called distance. That field contains the calculated distance between the restaurant and the landmark.
        distanceField: "distance",
        // spherical: true Indicates that distance calculations should be performed on the Earth's sphere (realistic model), not on a Cartesian plane. This is important for geographic coordinates.
        spherical: true
      }
    },
    { $limit: 10 }
  ]).toArray()
)