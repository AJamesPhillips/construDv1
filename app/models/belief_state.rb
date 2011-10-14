class BeliefState < ActiveRecord::Base
  attr_accessible :user_id, :element_id, :believed_state
  
  belongs_to :user
  belongs_to :element
  
  VALID_BELIEF_STATES = ['t','d','f','c'] ## 'c' is for when the author has been internal contradictory
  validates :believed_state, { :inclusion => VALID_BELIEF_STATES }
  
  scope :not_archived, lambda { where(:archived => false)}
  scope :by_user,      lambda {|the_user_id| where(:user_id => the_user_id) }
  scope :for_element,  lambda {|the_element_id| where(:element_id => the_element_id) }
  
end
