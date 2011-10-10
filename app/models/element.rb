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
  attr_accessible :element_type, :subtype, :content, :user_id, :archived, :public, :id_of_parent_of_part_element, :connection_direction
  attr_accessor :id_of_parent_of_part_element, :connection_direction
  
  belongs_to :user
  has_many :inter_element_links1, :foreign_key => 'element1_id', :class_name => 'InterElementLink', :dependent => :destroy
  has_many :inter_element_links2, :foreign_key => 'element2_id', :class_name => 'InterElementLink', :dependent => :destroy
  has_many :belief_states
  #has_many :elements1, :through => :inter_element_links1#, :source => 'element'
  #has_many :elements2, :through => :inter_element_links2#, :source => 'element'
  
  
  validate :content_for_nodes
  VALID_ELEMENT_TYPES = ['node', 'connection', 'part']
  validates :element_type, { :presence => true,
                             :inclusion => VALID_ELEMENT_TYPES }
                             
  VALID_NODE_SUBTYPES = ['statement', 'sub-statement', 'question', 'reference', 'answer']
  VIEW_READY_FORWARD_CONNECTION_SUBTYPES =  {'supports'        => 'supports', 'refutes'       => 'refutes', 'questions'        => 'questions', 'defines'       => 'definition'}
  VIEW_READY_BACKWARD_CONNECTION_SUBTYPES = {'is supported by' => 'supports', 'is refuted by' => 'refutes', 'is questioned by' => 'questions', 'is defined by' => 'definition'}
  VIEW_READY_CONNECTION_SUBTYPES = VIEW_READY_FORWARD_CONNECTION_SUBTYPES.merge VIEW_READY_BACKWARD_CONNECTION_SUBTYPES
  VALID_CONNECTION_SUBTYPES = ['questions', 'supports', 'refutes', 'answer questions', 'answer supports', 'answer refutes', 'definition']
  validate :ensure_subtypes_are_valid
  before_save :wipe_part_subtype
  validate :ensure_presence_of_valid_parent_node_id_if_this_is_a_part_element
  
  
  
  def inter_element_links
    inter_element_links1 + inter_element_links2
  end
  
  
  
  
  def make_inter_element_link(other_element)
    if id < other_element.id
      an_iel_link = InterElementLink.new({:element1_id => id, :element2_id => other_element.id })
      return an_iel_link.save
      
    elsif id > other_element.id
      an_iel_link = InterElementLink.new({:element1_id => other_element.id, :element2_id => id })
      return an_iel_link.save
      
    else ##the other element supplied must be this element itself, so reject the formation of an iel_link
      return false
    end
  end
  
##  def elements
##    elements1 + elements2
##  end
  
  
  scope :nodes,      lambda { where(:element_type => 'node') }
  scope :statements, lambda { where(:element_type => 'node', :subtype => 'statement') }
  scope :references, lambda { where(:element_type => 'node', :subtype => 'reference') }
  scope :statements_and_references, lambda { where(:element_type => 'node', :subtype => VALID_NODE_SUBTYPES) }
  
  
  
  def self.search(search)
    if search
      statements_and_references.find(:all, :conditions => ['LOWER(content) LIKE ?', "%#{search.downcase}%"])
    else
      []
    end
  end
  
  
  def is_a_node?
    element_type == 'node'
  end
  
  def is_a_question_node?
    (element_type == 'node' && subtype == 'question')
  end
  
  def is_a_connection?
    element_type == 'connection'
  end
  
  def is_a_part_element?
    element_type == 'part'
  end
  
  
private
    def content_for_nodes
      if is_a_node?
        if content.nil?
          errors.add(:content, "for a node must be > 6 characters  #in ensure_subtypes_are_valid of element.rb")
        else
          if content.length < 7
            errors.add(:content, "for a node must be > 6 characters  #in ensure_subtypes_are_valid of element.rb")
          else
            return true
          end
        end
          
      else
        return true ##it's not a ndoe so don't care about it's content
      end
      return false
    end
    
    
    def ensure_subtypes_are_valid
      if is_a_node?
        if VALID_NODE_SUBTYPES.include? subtype
          return true
        else
          errors.add(:subtype, "for this 'node' had a value of '#{subtype}' but must be one of these values: #{VALID_NODE_SUBTYPES}.  #in ensure_subtypes_are_valid of element.rb")
        end
         
      elsif is_a_connection?
        if VALID_CONNECTION_SUBTYPES.include? subtype
          return true
        else
          errors.add(:subtype, "for this 'connection' had a value of '#{subtype}' but must be one of these values: #{VALID_CONNECTION_SUBTYPES}.  #in ensure_subtypes_are_valid of element.rb")
        end
        
      elsif is_a_part_element?
        unless subtype.empty?
          logger.warn(">>> subtype for this 'part' had a value of '#{subtype}' but it should be left blank.  #in ensure_subtypes_are_valid of element.rb") 
        end
        return true  ## still return true
      end
      false
    end
    
    def wipe_part_subtype
      logger.warn("XXX    subtype for this #{element_type} had a value of '#{subtype}' but it should be left blank.  #in ensure_subtypes_are_valid of element.rb") 
      self.subtype = nil if is_a_part_element?
      logger.warn("XXX    subtype for this #{element_type} had a value of '#{subtype}' but it should be left blank.  #in ensure_subtypes_are_valid of element.rb")
    end
    
    
    def ensure_presence_of_valid_parent_node_id_if_this_is_a_part_element
      logger.debug("element type = #{element_type}, self.new_record? = #{self.new_record?}, self.is_a_part_element? = #{self.is_a_part_element?}.  #in ensure_presence_of_valid_parent_node_id_if_this_is_a_part_element of element.rb")
      ##check if this element is unsaved and of type == 'part'
      if self.new_record? && self.is_a_part_element?
        ## this is a new 'part' element, check if it has a valid parent node
        if id_of_parent_of_part_element.nil?
          ##fail due to lacking any id for it's parent node
          logger.debug("part element lacks _any_ parent node id   #in ensure_presence_of_valid_parent_node_id_if_this_is_a_part_element of element.rb")
          errors.add(:id_of_parent_of_part_element, "for this 'part' is absent  #in ensure_presence_of_valid_parent_node_id_if_this_is_a_part_element of element.rb")
        else
          parent_node = Element.find(id_of_parent_of_part_element)
          if parent_node.nil?
            ##fail due to lacking a valid id for it's parent
            logger.debug(" 'part' element lacks a valid id for it's parent node  #in ensure_presence_of_valid_parent_node_id_if_this_is_a_part_element of element.rb")
            errors.add(:id_of_parent_of_part_element, "is invalid as it is not present at all  #in ensure_presence_of_valid_parent_node_id_if_this_is_a_part_element of element.rb")
          else
            if parent_node.is_a_node?
              return true
            else
              logger.debug(" 'part' element lacks a valid id for it's parent node  #in ensure_presence_of_valid_parent_node_id_if_this_is_a_part_element of element.rb")
              errors.add(:id_of_parent_of_part_element, "is invalid as it is not a node but is a #{parent_node.element_type}  #in ensure_presence_of_valid_parent_node_id_if_this_is_a_part_element of element.rb")
            end
          end
        end
      else
        ## this is an old part or a new connection or node, but not a new part element so return true to allow validation to pass
        return true
      end
      return false
    end
  
  
end


