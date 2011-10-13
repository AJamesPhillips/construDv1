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
  attr_accessible :element_type, :subtype, :content, :user_id, :archived, :public, :id_of_parent_of_part_element, :connection_direction, :connects_from, :connects_to
  attr_accessor :id_of_parent_of_part_element, :connection_direction
  
  belongs_to :user
  has_many :inter_element_links1, :foreign_key => 'element1_id', :class_name => 'InterElementLink', :dependent => :destroy
  has_many :inter_element_links2, :foreign_key => 'element2_id', :class_name => 'InterElementLink', :dependent => :destroy
  has_many :belief_states
  #has_many :elements1, :through => :inter_element_links1#, :source => 'element'
  #has_many :elements2, :through => :inter_element_links2#, :source => 'element'
  
  
  validate :check_content_is_valid
  VALID_ELEMENT_TYPES = ['node', 'connection', 'part']
  validates :element_type, { :presence => true,
                             :inclusion => VALID_ELEMENT_TYPES }
                             
  VALID_NODE_SUBTYPES = ['statement', 'sub-statement', 'question', 'reference', 'answer']
  VIEW_READY_FORWARD_CONNECTION_SUBTYPES =  {'supports'        => 'supports', 'refutes'       => 'refutes', 'questions'        => 'questions', 'defines'       => 'definition'}
  VIEW_READY_BACKWARD_CONNECTION_SUBTYPES = {'is supported by' => 'supports', 'is refuted by' => 'refutes', 'is questioned by' => 'questions', 'is defined by' => 'definition'}
  VIEW_READY_CONNECTION_SUBTYPES = VIEW_READY_FORWARD_CONNECTION_SUBTYPES.merge VIEW_READY_BACKWARD_CONNECTION_SUBTYPES
  VALID_CONNECTION_SUBTYPES = ['questions', 'supports', 'refutes', 'definition']
  VALID_ANSWER_NODE_SUBTYPES = ['pro answer', 'dn answer', 'anti answer']
  validate :ensure_subtypes_are_valid
  before_save :wipe_part_subtype
  validate :ensure_presence_of_valid_parent_node_id_if_this_is_a_part_element
  
  
  
  
  scope :active,  lambda { where(:archived => false) }
  scope :by_user, lambda {|the_user_id| where(:user_id => the_user_id) }
  
  scope :nodes,       lambda { where(:element_type => 'node') }
  scope :statements,  lambda { where(:element_type => 'node', :subtype => 'statement') }
  scope :references,  lambda { where(:element_type => 'node', :subtype => 'reference') }
  scope :statements_and_references, lambda { where(:element_type => 'node', :subtype => VALID_NODE_SUBTYPES) }
  
  scope :connections,      lambda { where(:element_type => 'connection') }
  scope :connections_to,   lambda {|element_id| where(:connects_to => element_id) }
  scope :connections_from, lambda {|element_id| where(:connects_from => element_id) }
  
  scope :part_elements,    lambda { where(:element_type => 'part') }
  
  scope :iel_1links,     lambda {|seed_element_id| select(%("inter_element_links"."element1_id" as "id")).joins(:inter_element_links2).where(:id => seed_element_id) }
  scope :iel_2links,     lambda {|seed_element_id| select(%("inter_element_links"."element2_id" as "id")).joins(:inter_element_links1).where(:id => seed_element_id) }
  scope :other_elements, lambda {|seed_element_id| where(:id => (iel_1links(seed_element_id) + iel_2links(seed_element_id))) }
  
  scope :simple__all_active_connections_to_an_element_by_a_user,   lambda {|the_element_id, the_user_id| active.connections_to(the_element_id).by_user(the_user_id) }
  scope :robust__all_active_connections__to__an_element,           lambda {|the_element_id| active.other_elements(the_element_id).connections_to(the_element_id) }
  scope :robust__all_active_connections__to__an_element_by_a_user, lambda {|the_element_id, the_user_id| robust__all_active_connections__to__an_element.by_user(the_user_id) }
  
  scope :robust__all_active_connections_from_an_element,           lambda {|the_element_id| active.other_elements(the_element_id).connections_from(the_element_id) }
  scope :robust__all_active_connections_from_an_element_by_a_user, lambda {|the_element_id, the_user_id| robust__all_active_connections_from_an_element.by_user(the_user_id) }
  
  scope :belief_not_archived,   lambda { where(:belief_states => {:archived => false}) }
  scope :active_belief_states,  lambda { joins(:belief_states).belief_not_archived }
  scope :active_belief_states_by_user, lambda {|the_user_id| active_belief_states.where(:user_id => the_user_id) }
  
  
  def self.search(search)
    if search
      nodes.find(:all, :conditions => ['LOWER(content) LIKE ?', "%#{search.downcase}%"])
    else
      []
    end
  end
  
  
  
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

    
  
  def is_a_node?
    element_type == 'node'
  end
  def is_a_question_node?
    (element_type == 'node' && subtype == 'question')
  end
  def is_an_answer_node?
    (element_type == 'node' && subtype.include?('answer'))
  end
  def is_a_reference_node?
    (element_type == 'node' && subtype.include?('reference'))
  end
  def is_a_statement_node?
    (element_type == 'node' && subtype.include?('statement'))
  end
  def is_a_sub_statement_node?
    (element_type == 'node' && subtype.include?('sub-statement'))
  end
  
  def is_a_connection?
    element_type == 'connection'
  end
  
  def is_a_part_element?
    element_type == 'part'
  end
  
  
  ## return a list of part elements for this node element, by a specific author, or by any author
  def parts(user_id)
    part_elements = []
    if is_a_node?
      if user_id
        part_elements = Element.other_elements(self.id).by_user(user_id).part_elements
      else
        part_elements = Element.other_elements(self.id).part_elements
      end
    end
    return part_elements
  end
  
  
  
  ##user has created an element, make sure this user's elements belief states are up to date.
  def refresh_belief_states
    logger.debug(">>>  #in refresh_belief_states of element.id = #{id} for user.id = #{user_id}")
    if is_a_part_element?
      ##find parent node and call the refresh_belief_states on this
      Element.find(connects_to).refresh_belief_states
      
    else
      elements_beneath = find_elements_beneath_an_element(self, {:belief_user_id => self.user_id, :exclude_elements_beneath_a_nodes_part => false})
      
      #propagate_belief_state(elements_beneath, self, nil)
    end
  end
  
  
  
private
    def find_elements_beneath_an_element(the_element, options = {}) ##options take  :exclude_elements_beneath_a_nodes_part, :element_user_id, :belief_user_id
=begin
      if options[:element_user_id]
        if options[:belief_user_id}
          elements_beneath = Element.robust__all_active_connections__to__an_element_by_a_user(the_element.id, options.element_user_id).active_belief_states_by_user(options.belief_user_id)
        else
          elements_beneath = Element.robust__all_active_connections__to__an_element_by_a_user(the_element.id, options.element_user_id)
        end
      else
        if options[:belief_user_id}
          elements_beneath = Element.robust__all_active_connections__to__an_element(the_element.id).active_belief_states_by_user(options.belief_user_id)
        else
          elements_beneath = Element.robust__all_active_connections__to__an_element(the_element.id)
        end
      end
=end      
      logger.debug(">>>1  elements_beneath = #{elements_beneath.all} for element of id = #{the_element.id}  #in find_elements_beneath_an_element of Element.rb ")
      
    end
=begin      
      if the_element.is_a_node? ## the_element is a node element which may have part elements associated with it.  If so, and if exclude_elements_beneath_a_nodes_part = false,
        ##get the elements beneath these parts
        if options.exclude_elements_beneath_a_nodes_part
          ## do nothing extra
        else
          ##find this nodes parts, and the elements beneath them
          elements_beneath += the_element.parts(options.user_id).map {|part_element|
            find_elements_beneath_an_element(part_element, {:user_id => options.user_id})
          }
          logger.debug(">>>2  elements_beneath = #{elements_beneath.all} for element of id = #{the_element.id}  #in find_elements_beneath_an_element of Element.rb ")
          elements_beneath.flatten!
          logger.debug(">>>3  elements_beneath = #{elements_beneath.all} for element of id = #{the_element.id}  #in find_elements_beneath_an_element of Element.rb ")
        end
        
      elsif the_element.is_a_connection?  ## the_element is a connection, so find the node it connects from and add this to the 'elements_beneath' array
        unless the_element.connects_from.nil?
          node = Element.find(the_element.connects_from)
          if node.nil?
            logger.error(">>>  data integrity error detected for connection.id = #{id}, whose connects_from value (#{connects_from}) references a non-existant element    #in find_elements_beneath_an_element of Element.rb")
          else
            elements_beneath.push node 
          end
        end
      elsif the_element.is_a_part_element?
        ## do nothing extra
      else
        ## error
        logger.error(">>>  error, element.type = #{the_element.element_type}, for element.id = #{the_element.id}   #in find_elements_beneath_an_element of element.rb")
      end
      
      logger.debug(">>>4  elements_beneath = #{elements_beneath.all} for element of id = #{the_element.id}  #in find_elements_beneath_an_element of Element.rb ")
      
      return elements_beneath
    end
    
    
    
    def find_elements_above_an_element(the_element, options = {}) ##options take :user_id
      if the_element.is_a_node?
        ##find any connections from this
        elements_above = find_elements_above_a_node_element(the_element, options)
      elsif the_element.is_a_connection? || the_element.is_a_part_element?
        elements_above = find_elements_above_a_part_or_connection_element(the_element, options)
      end
      return elements_above
    end
    
    
    def find_elements_above_a_node_element(the_element, options = {}) ##options take :user_id
      ##find any connections from this
      if options.user_id
        elements_above = Element.robust__all_active_connections_from_an_element_by_a_user(the_element.id, the_element.user_id)
      else
        elements_above = Element.robust__all_active_connections_from_an_element(the_element.id)
      end
      return elements_above
    end
    
    
    def find_elements_above_a_part_or_connection_element(the_element, options = {}) ##options take :user_id
      ##get the node that this part or connection connects to
      if options.user_id
        node_above = Element.find(the_element.connects_to).by_user(options.user_id) unless the_element.connects_to.nil?
      else
        node_above = Element.find(the_element.connects_to) unless the_element.connects_to.nil?
      end
      return node_above
    end
    
    
    
    
    def propagate_belief_state(elements_beneath, the_element, new_belief_state)
      ##first test if there are any elements beneath this element
      if elements_beneath.empty?
        ## this is a seed element, i.e. an element at the bottom of an argument, whose belief state
        ##  needs to be propagated up.
        ##test if it has a belief state, if not then set it
        a_belief_state = BeliefState.for_element(the_element.id).by_user(the_element.user_id).not_archived
        logger.debug(">>>   belief state for element_id = #{the_element.id}, and user_id = #{the_element.user_id}  is #{a_belief_state}   #in propagate_belief_state of element.rb")
        if a_belief_state.nil?
          a_belief_state = BeliefState.new(:user_id => the_element.user_id, :element_id => the_element.id, :believed_state => 't')
          a_belief_state.save
          new_belief_state = a_belief_state.believed_state
        end
        
      else
        ## there are elements beneath this element, by the same user, 
        ##  so take the logical sum of their belief states and apply it to this element
        
      end
      
      unless new_belief_state.nil?  ## there's been a new belief state so use this
        
        ##find if anything is above this element
        if the_element.is_a_node?
          ##find any connections from this
          elements_above = find_elements_above_a_node_element(the_element, {:user_id => the_element.user_id})
          unless elements_above.empty?
            ##iterate over the elements current belief state and check they're correct
            elements_above.each {|element_above|
              middle_belief_state = BeliefStates.not_archived.by_user(element_above.user_id).for_element(element_above.id)
              sibling_input_states = element_above.find_elements_beneath_an_element(element_above, {:user_id => element_above.user_id}).remove(the_element).active_belief_states_by_user(element_above.user_id)
              sibling_input_states = sibling_input_states.map {|sibling_input| sibling_input.believed_state }
              
              state_for_middle = test_for_inconsistent_logical_states(new_belief_state, middle_belief_state, sibling_input_states)
              if state_for_middle
                ## update this belief_state's believed_state
                element_above.believed_state = state_for_middle
                if element_above.save
                  logger.debug(">>>   belief state for element.id = #{belief_state.element_id} and user.id = #{belief_state.user_id} is saved   #in propagate_belief_state of element.rb")
                  propagate_belief_state([:not_a_seed_element], element_above, state_for_middle)
                else
                  logger.debug(">>>   failed to save belief state for element.id = #{belief_state.element_id} and user.id = #{belief_state.user_id} is saved   #in propagate_belief_state of element.rb")
                end
              end
            }
            
          end
          
        elsif the_element.is_a_connection? || the_element.is_a_part_element?
          node_above = find_elements_above_a_part_or_connection_element(the_element, options)
          
          
        end
        
      end
      
    end
    
    
    
    def test_for_inconsistent_logical_states(input_state, middle_state, sibling_input_states)
      if (BeliefStates::VALID_BELIEF_STATES.includes? input_state) && (BeliefStates::VALID_BELIEF_STATES.includes? middle_state)
        
        if (input_state == 'c')
          ##skip this process
          return false
        else
          sum = {:t => 0, :d => 0, :f => 0, :c => 0 }
          sibling_input_states.each {|state|
            state = state.to_sym
            sum[state] += 1
          }
          if input_state == 't'
            
          end
          
          
        end
        
      else
        logger.error(">>>  ERROR: input_state = #{input_state}  middle_state = #{middle_state} BeliefStates::VALID_BELIEF_STATES.includes? input_state = #{BeliefStates::VALID_BELIEF_STATES.includes? input_state}\n   BeliefStates::VALID_BELIEF_STATES.includes? middle_state = #{BeliefStates::VALID_BELIEF_STATES.includes? middle_state}  # in sum_logical_state of element.rb")
        return false
      end
    end
=end    
    
    
    def check_content_is_valid
      logger.warn(">>> #in check_content_is_valid of element.rb") 
      if is_a_node?
        if content.nil?
          errors.add(:content, "for a node must be > 6 characters  #in check_content_is_valid of element.rb")
        else
          if content.length < 7
            errors.add(:content, "for a node must be > 6 characters  #in check_content_is_valid of element.rb")
            logger.error(">>>  content.length = #{content.length} #in check_content_is_valid of element.rb") 
          else
            return true
          end
        end
      
      elsif is_a_connection?
        ##parse the content into the connects_to and connects_from fields
        connect_ids = content.split(',')
        self.connects_from = connect_ids[0]
        self.connects_to = connect_ids[1]
        return true
      elsif is_a_part_element?
        ## @TODO put a check here for "N1..N2"  where N1 and N2 are both valid numbers for the content 
        ##   of the parent node that this part node references
        return true
      else
        return true ##it's not a node so don't care about it's content
      end
      return false
    end
    
    
    def ensure_subtypes_are_valid
      logger.debug(">>>   #in ensure_subtypes_are_valid of element.rb") 
      if is_a_node?
        if is_an_answer_node?
          VALID_ANSWER_NODE_SUBTYPES.include? subtype
          return true
        else
          if VALID_NODE_SUBTYPES.include? subtype
            return true
          end
        end
        errors.add(:subtype, "for this 'node' had a value of '#{subtype}' but must be one of these values: #{VALID_NODE_SUBTYPES}.  #in ensure_subtypes_are_valid of element.rb")
         
      elsif is_a_connection?
        if VALID_CONNECTION_SUBTYPES.include? subtype
          return true
        else
          errors.add(:subtype, "for this 'connection' had a value of '#{subtype}' but must be one of these values: #{VALID_CONNECTION_SUBTYPES}.  #in ensure_subtypes_are_valid of element.rb")
        end
        
      elsif is_a_part_element?
        unless subtype.nil?
          logger.warn(">>> subtype for this 'part' had a value of '#{subtype}' but it should be left blank.  #in ensure_subtypes_are_valid of element.rb") 
          subtype = nil
        end
        return true  ## still return true
      end
      false
    end
    
    
    def wipe_part_subtype
      logger.warn("XXX    subtype for this #{element_type} had a value of '#{subtype}' but it should be left blank.  #in ensure_subtypes_are_valid of element.rb") 
      self.subtype = nil if is_a_part_element?
      logger.warn("XXX    subtype for this #{element_type} had a value of '#{subtype}' but it should be left blank.  #in ensure_subtypes_are_valid of element.rb")
      return true
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





