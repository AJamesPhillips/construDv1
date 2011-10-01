class AddPublicToElements < ActiveRecord::Migration
  def self.up
    add_column :elements, :public, :boolean, :default => false
  end

  def self.down
    remove_column :elements, :public
  end
end
