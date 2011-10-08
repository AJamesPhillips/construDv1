class InterElementLink < ActiveRecord::Base
   
  
  set_primary_keys :element1_id, :element2_id   ## I have included the 'composite_primary_keys', '=3.1.0' gem
  #belongs_to :element
  has_many :element1s, :primary_key => :element1_id, :foreign_key => :id, :class_name => 'Element'
  has_many :element2s, :primary_key => :element2_id, :foreign_key => :id, :class_name => 'Element'#, :key => 'id', :class_name => 'Element'
  #belongs_to :element2, :foreign_key => 'id', :class_name => 'Element'
  
  
  def elements
    element1s + element2s
  end
  #belongs_to :element
  #has_many :elements, :foreign_key => [:from_element_id, :to_element_id]
  

  
end

# == Schema Information
#
# Table name: inter_element_links
#
#  element1_id :integer         not null
#  element2_id :integer         not null
#  created_at  :datetime
#  updated_at  :datetime
#

