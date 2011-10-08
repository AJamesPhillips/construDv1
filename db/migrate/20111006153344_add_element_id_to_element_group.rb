class AddElementIdToElementGroup < ActiveRecord::Migration
  def self.up
    add_column :elements, :element_group_id, :integer
  end

  def self.down
    remove_column :elements, :element_group_id
  end
end
