# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20111012125355) do

  create_table "belief_states", :force => true do |t|
    t.integer  "user_id",                           :null => false
    t.integer  "element_id",                        :null => false
    t.string   "believed_state",                    :null => false
    t.boolean  "archived",       :default => false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "belief_states", ["element_id"], :name => "index_belief_states_on_element_id"
  add_index "belief_states", ["user_id"], :name => "index_belief_states_on_user_id"

  create_table "elements", :force => true do |t|
    t.string   "element_type",                     :null => false
    t.string   "subtype"
    t.string   "content"
    t.integer  "user_id",                          :null => false
    t.boolean  "archived",      :default => false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "public",        :default => false
    t.integer  "connects_from"
    t.integer  "connects_to"
  end

  add_index "elements", ["connects_from"], :name => "index_elements_on_connects_from"
  add_index "elements", ["connects_to"], :name => "index_elements_on_connects_to"
  add_index "elements", ["user_id"], :name => "index_elements_on_user_id"

  create_table "inter_element_links", :id => false, :force => true do |t|
    t.integer  "element1_id", :null => false
    t.integer  "element2_id", :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "inter_element_links", ["element1_id", "element2_id"], :name => "index_inter_element_links_on_element1_id_and_element2_id", :unique => true

  create_table "users", :force => true do |t|
    t.string   "name"
    t.string   "email"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "encrypted_password"
    t.string   "salt"
    t.boolean  "admin",              :default => false
  end

  add_index "users", ["email"], :name => "index_users_on_email", :unique => true
  add_index "users", ["name"], :name => "index_users_on_name", :unique => true

end
