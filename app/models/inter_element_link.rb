class InterElementLink < ActiveRecord::Base
   
  
  set_primary_keys :element1_id, :element2_id   ## I have included the 'composite_primary_keys', '=3.1.0' gem
  
  ## no idea why the belongs_to doesn't work.
  ##  ** BROKEN **
  has_one :element1, :primary_key => :element1_id, :foreign_key => :id, :class_name => 'Element'
  has_one :element2, :primary_key => :element2_id, :foreign_key => :id, :class_name => 'Element'#, :key => 'id', :class_name => 'Element'
  ##  ** BROKEN **
  #has_many :element1s, :primary_key => :element1_id, :foreign_key => :id, :class_name => 'Element'
  #has_many :element2s, :primary_key => :element2_id, :foreign_key => :id, :class_name => 'Element'
  
  scope :other_2elements, lambda {|element2_ids| joins(:elements).where(:id => element2_ids) }
  
  def elements
    return [element1, element2]
  end
  
  def element(element_to_ignore)
    logger.debug(">>> element_to_ignore = #{element_to_ignore}  #in elements of InterElementLink")
    id_to_exclude = element_to_ignore.id
    if element1_id == id_to_exclude
      result = element2
    elsif element2_id == id_to_exclude
      result = element1
    else
      result = elements  ## this should mess things up loudly.
    end
    logger.debug(">>> result = #{result}  #in elements of InterElementLink")
    return result
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

