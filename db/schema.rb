# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2025_11_15_000002) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "buildings", force: :cascade do |t|
    t.bigint "client_id", null: false
    t.string "name", null: false
    t.string "address"
    t.string "city"
    t.string "state"
    t.string "postal_code"
    t.integer "year_built"
    t.integer "floors"
    t.jsonb "custom_field_values", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["client_id"], name: "index_buildings_on_client_id"
    t.index ["custom_field_values"], name: "index_buildings_on_custom_field_values", using: :gin
    t.index ["postal_code"], name: "index_buildings_on_postal_code"
  end

  create_table "clients", force: :cascade do |t|
    t.string "name", null: false
    t.jsonb "custom_fields", default: [], null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_clients_on_name"
  end

  add_foreign_key "buildings", "clients"
end
