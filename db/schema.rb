# This file is auto-generated from the current state of the database. Instead of editing this file, 
# please use the migrations feature of Active Record to incrementally modify your database, and
# then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your database schema. If you need
# to create the application database on another system, you should be using db:schema:load, not running
# all the migrations from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20091013121419) do

  create_table "dataset_restrictions", :force => true do |t|
    t.string   "from_ip"
    t.string   "to_ip"
    t.integer  "dataset_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "datasets", :force => true do |t|
    t.string   "type"
    t.string   "name"
    t.string   "label"
    t.string   "description"
    t.boolean  "active",      :default => true
    t.integer  "load",        :default => 10
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "filter_terms", :force => true do |t|
    t.string   "term"
    t.string   "index"
    t.string   "match"
    t.integer  "sequence"
    t.integer  "query_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "queries", :force => true do |t|
    t.string   "state",         :default => "idle"
    t.integer  "total_records"
    t.string   "user_ip"
    t.integer  "database_id"
    t.integer  "user_id"
    t.string   "session_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "query_terms", :force => true do |t|
    t.string   "term"
    t.string   "index"
    t.string   "match"
    t.integer  "sequence"
    t.integer  "query_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "result_datas", :force => true do |t|
    t.string   "key"
    t.string   "value"
    t.integer  "result_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "results", :force => true do |t|
    t.string   "from_record"
    t.string   "to_record"
    t.integer  "query_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "sessions", :force => true do |t|
    t.string   "session_id", :null => false
    t.text     "data"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "sessions", ["session_id"], :name => "index_sessions_on_session_id"
  add_index "sessions", ["updated_at"], :name => "index_sessions_on_updated_at"

  create_table "users", :force => true do |t|
    t.string   "username"
    t.string   "email"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
