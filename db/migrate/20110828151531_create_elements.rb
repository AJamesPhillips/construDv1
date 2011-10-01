class CreateElements < ActiveRecord::Migration
  def self.up
    create_table :elements do |t|
      t.string :element_type, :null => false
      t.string :subtype
      t.string :content
      t.integer :user_id, :null => false
      t.boolean :archived, :default => false

      t.timestamps
    end
    add_index :elements, :user_id
  end

  def self.down
    remove_index :elements, :user_id
    drop_table :elements
  end
end
