# == Schema Information
#
# Table name: elements
#
#  id           :integer         not null, primary key
#  element_type :string(255)     not null
#  subtype      :string(255)
#  content      :string(255)
#  user_id      :integer         not null
#  archived     :boolean         default(FALSE)
#  created_at   :datetime
#  updated_at   :datetime
#


class Element < ActiveRecord::Base
  attr_accessible :element_type, :subtype, :content, :user_id, :archived, :public
  
  
  belongs_to :user
  has_many :inter_element_links1, :foreign_key => 'element1_id', :class_name => 'InterElementLink', :dependent => :destroy
  has_many :inter_element_links2, :foreign_key => 'element2_id', :class_name => 'InterElementLink', :dependent => :destroy
  has_many :belief_states
  #has_many :elements1, :through => :inter_element_links1#, :source => 'element'
  #has_many :elements2, :through => :inter_element_links2#, :source => 'element'
  
  def inter_element_links
    inter_element_links1 + inter_element_links2
  end
  
  def elements
    elements1 + elements2
  end
  
  
  scope :statements, lambda { where(:element_type => 'node', :subtype => 'statement') }
  scope :references, lambda { where(:element_type => 'node', :subtype => 'reference') }
  scope :statements_and_references, lambda { where(:element_type => 'node', :subtype => ['statement', 'reference', 'question']) }
  
  
  
  def self.search(search)
    if search
      statements_and_references.find(:all, :conditions => ['LOWER(content) LIKE ?', "%#{search.downcase}%"])
    else
      []
    end
  end
  
  
  def is_a_question_node?
    (element_type == 'node' && subtype == 'question')
  end
  
  
end


