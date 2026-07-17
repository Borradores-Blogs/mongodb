// ======================================
// CREATE COLLECTION
// ======================================
// db.getCollectionNames() gets an array with the names of all existing collections in the current database.
// .includes("restaurants") checks if a collection called "restaurants" exists within that array.
// if (! ... ) The ! sign negates the condition → This means: "If a collection called restaurants does NOT exist..."
// db.createCollection("restaurants") Creates a new collection called restaurants.
if (!db.getCollectionNames().includes("restaurants")) {
  db.createCollection("restaurants")
  print("✅ Collection created")
} else {
  print("ℹ️ Collection already exists")
}

// ======================================
// INDEXES
// ======================================
print("\n📌 Creating indexes...")

print("📌 Index: name")
// db.restaurants Refers to the collection named restaurants within the current database.
// .createIndex({ name: 1 }) Creates an index on the name field. The value 1 indicates that the index will be in ascending order (if it were -1, it would be descending).
// printjson(...) Prints the result of the operation to the console in JSON format.
printjson(db.restaurants.createIndex({ name: 1 }))

print("\n📌 Index: category")
printjson(db.restaurants.createIndex({ category: 1 }))

print("\n📌 Index: score")
printjson(db.restaurants.createIndex({ score: -1 }))

print("\n📌 Index: ratings")
printjson(db.restaurants.createIndex({ ratings: -1 }))

print("\n📌 Index: zip_code")
// .createIndex({ "address.zip_code": 1 }) Creates an index on the zip_code field within the embedded document address.
// This means MongoDB will be able to quickly search and sort by postal code within the address.
printjson(db.restaurants.createIndex({ "address.zip_code": 1 }))

print("\n📌 Index: geospatial location")
// The type "2dsphere" indicates that the index is designed for geospatial data in GeoJSON format (points, polygons, lines).
printjson(db.restaurants.createIndex({ location: "2dsphere" }))

print("\n📌 Index: compound (category + score)")
// .createIndex({ category: 1, score: -1 }) Creates an index on two fields at once: category in ascending order (1), score in descending order (-1).
// This means that MongoDB will first organize by category, and within each category, it will order by score from highest to lowest.
printjson(db.restaurants.createIndex({ category: 1, score: -1 }))

print("✅ Indexes created")
