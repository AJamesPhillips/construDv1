class BeliefStates < ActiveRecord::Base
  attr_accessible :user_id, :element_id, :believed_true
  
  belongs_to :user
  belongs_to :element
  
  validates :believed_true, { :inclusion => ['t','d','f'] }
  
  scope :not_archived, lambda { where(:archived => false)}
  
  
end
