class CreateElementGroups < ActiveRecord::Migration
  def self.up
    create_table :element_groups do |t|
    end
  end

  def self.down
    drop_table :element_groups
  end
end
