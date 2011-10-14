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
  scope :find_by_element_id, lambda {|an_element_id| where(:id => an_element_id) }
  
  scope :nodes,       lambda { where(:element_type => 'node') }
  scope :statements,  lambda { where(:element_type => 'node', :subtype => 'statement') }
  scope :references,  lambda { where(:element_type => 'node', :subtype => 'reference') }
  scope :statements_and_references, lambda { where(:element_type => 'node', :subtype => VALID_NODE_SUBTYPES) }
  
  scope :connections,      lambda { where(:element_type => 'connection') }
  scope :connections_to,   lambda {|element_id| where(:connects_to => element_id) }
  scope :connections_from, lambda {|element_id| where(:connects_from => element_id) }
  
  scope :part_elements,    lambda { where(:element_type => 'part') }
  ## return a list of part elements for this node element, by a specific author, or by any author
  scope :part_elements_for_element_id, lambda {|an_element_id| other_elements(an_element_id).part_elements }
  scope :part_elements_for_element_id_by_user_id, lambda {|an_element_id, a_user_id| part_elements_for_element_id(an_element_id).by_user(a_user_id) }
  
  
  scope :iel_1links,     lambda {|seed_element_id| select(%("inter_element_links"."element1_id" as "id")).joins(:inter_element_links2).where(:id => seed_element_id) }
  scope :iel_2links,     lambda {|seed_element_id| select(%("inter_element_links"."element2_id" as "id")).joins(:inter_element_links1).where(:id => seed_element_id) }
  scope :other_elements, lambda {|seed_element_id| where(:id => (iel_1links(seed_element_id) + iel_2links(seed_element_id))) }
  
  #scope :simple__all_active_connections_to_an_element_by_a_user,   lambda {|the_element_id, the_user_id| active.connections_to(the_element_id).by_user(the_user_id) }
  scope :robust__all_active_connections__to__an_element,           lambda {|the_element_id| active.other_elements(the_element_id).connections_to(the_element_id) }
  scope :robust__all_active_connections__to__an_element_by_a_user, lambda {|the_element_id, the_user_id| robust__all_active_connections__to__an_element.by_user(the_user_id) }
  
  scope :robust__all_active_connections_from_an_element,           lambda {|the_element_id| active.other_elements(the_element_id).connections_from(the_element_id) }
  scope :robust__all_active_connections_from_an_element_by_a_user, lambda {|the_element_id, the_user_id| robust__all_active_connections_from_an_element.by_user(the_user_id) }
  
  
  scope :belief_not_archived,           lambda { where(:belief_states => {:archived => false}) }
  scope :active_belief_states,          lambda { joins(:belief_states).belief_not_archived }
  scope :active_belief_states_by_user,  lambda {|the_user_id| active_belief_states.where(:belief_states => {:user_id => the_user_id}) }
  scope :eager_load_belief_states,      lambda { includes(:belief_states) }
  
  
  
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
  def parts(user_id = nil)
    part_elements = []
    if is_a_node?
      if user_id
        part_elements = Element.part_elements_for_element_id_by_user_id(self.id, user_id)
      else
        part_elements = Element.part_elements_for_element_id(self.id)
      end
    end
    return part_elements
  end
  
  
  def set_belief_state(new_state, a_user_id = self.user_id)
    logger.debug(">>>   # in set_belief_state of element.rb\n" +
                 "      new_state = #{new_state} ")
    
    ##return the change in the state, either returning true if it's changed or returning false if it hasn't
    current_belief_state = BeliefState.for_element(self.id).by_user(a_user_id).not_archived.first
    
    logger.debug(">>>   current_belief_state.nil? = #{current_belief_state.nil?}    # in set_belief_state of element.rb")
    unless current_belief_state.nil? ##check there is a current_belief_state
      ##check current state is not equal to new_state.  If it is then do nothing and return nil
      logger.debug(">>>   (current_belief_state.believed_state (#{current_belief_state.believed_state}) == new_state (#{new_state})) = #{current_belief_state.believed_state == new_state}    \n### in set_belief_state of element.rb")
      return false if current_belief_state.believed_state == new_state
    end
    
    ## there is no  current_state  or  new_state != current_state  so make the new state and 
    ##  if it saves successfully, set the old state to archived (if the old state exists) 
    new_belief_state = BeliefState.new({:element_id => self.id, :user_id => a_user_id, :believed_state => new_state})
    
    logger.debug(">>>   new_belief_state = #{new_belief_state}    \n### in set_belief_state of element.rb")
    if new_belief_state.save!
      unless current_belief_state.nil?
        logger.debug(">>>  set_belief_state of element.rb  \n" +
                     "     current_belief_state.state = #{current_belief_state.believed_state}")
        current_belief_state.archived = true unless current_belief_state.nil?
        current_belief_state.save!
        logger.debug(">>>   current_belief_state.state = #{current_belief_state.believed_state}    # in set_belief_state of element.rb")
      end
      return true
    end
    
    
    return false
  end
  
  
  
  ##user has created an element, make sure this user's elements belief states are up to date.
  def self.refresh_belief_states(an_element, a_user_id, recursion_counter = 0)
    logger.debug(">>>1   #in refresh_belief_states element.rb  \n" +
                 "!start!#{recursion_counter} \n" +
                 "       element.id = #{an_element.id} for user.id = #{a_user_id}")
    recursion_counter+=1
    if recursion_counter > 100
      raise "ERROR   recursion_counter > 100    # in refresh_belief_states of element.rb"
      return
    end
    
    if an_element.is_a_question_node?
      ## do nothing
      
    elsif an_element.is_a_part_element?
      ##find parent node and call the refresh_belief_states on this
      logger.debug(">>>1.1a    #in refresh_belief_states element.rb  \n" +
                   "           we have a part element which connects to: #{an_element.connects_to}  ")      
      Element.refresh_belief_states(Element.find(an_element.connects_to), a_user_id, recursion_counter)
      
    else
      logger.debug(">>>1.1b    #in refresh_belief_states element.rb  \n" +
                   "          call to find_connection_elements_beneath_an_element_with_a_belief_state_by_same_user   with ((element id of:) #{an_element.id}, #{{:belief_user_id => a_user_id}})  ")
      elements_beneath_with_a_belief_state_by_same_user = find_connection_elements_beneath_an_element_with_a_belief_state_by_same_user(an_element, {:belief_user_id => a_user_id})
      logger.debug(">>>1.2b    #in refresh_belief_states element.rb  \n" +
                   "           elements_beneath_with_a_belief_state_by_same_user = #{elements_beneath_with_a_belief_state_by_same_user.all}  ")
      
      if an_element.is_a_node?
        additional_elements_beneath_with_a_belief_state_by_same_user = find_elements_beneath_the_part_elements_for_a_node_element_with_a_belief_state_by_same_user(an_element, {:belief_user_id => a_user_id})
      elsif an_element.is_a_connection?
        additional_elements_beneath_with_a_belief_state_by_same_user = find_the_node_element_beneath_a_connection_element_with_a_belief_state_by_same_user(an_element, {:belief_user_id => a_user_id})
      else
        additional_elements_beneath_with_a_belief_state_by_same_user = []
      end
      
      logger.debug(">>>2    #in refresh_belief_states element.rb  \n" +
                   "        elements_beneath_with_a_belief_state_by_same_user = #{elements_beneath_with_a_belief_state_by_same_user.all}   additional_elements_beneath_with_a_belief_state_by_same_user = #{additional_elements_beneath_with_a_belief_state_by_same_user.all}  ")
      
      if elements_beneath_with_a_belief_state_by_same_user.empty? && additional_elements_beneath_with_a_belief_state_by_same_user.empty?
        state_changed = an_element.set_belief_state('t', a_user_id)
        
      else
        logger.debug(">>>3   #in refresh_belief_states element.rb  \n" +
                     "       an_element.type = #{an_element.element_type} ")
        
        ##test if this element is a node or connection
        if an_element.is_a_node?
          logger.debug(">>>4a   #in refresh_belief_states of element.rb \n" +
                       "       additional_elements_beneath_with_a_belief_state_by_same_user = #{additional_elements_beneath_with_a_belief_state_by_same_user.all} ")
          
          unless elements_beneath_with_a_belief_state_by_same_user.empty?
            ## this node has connections to it which have belief states by this user
            logger.debug(">>>5a   #in refresh_belief_states of element.rb \n" +
                         "       elements_beneath_with_a_belief_state_by_same_user = #{elements_beneath_with_a_belief_state_by_same_user.all}  \n")
            ##logger.debug("       elements_beneath_with_a_belief_state_by_same_user = #{elements_beneath_with_a_belief_state_by_same_user.belief_states}  ")
            new_state_to_apply = evaluate_logical_value_of_elements(elements_beneath_with_a_belief_state_by_same_user, a_user_id) unless elements_beneath_with_a_belief_state_by_same_user.empty?
            logger.debug(">>>5b   #in refresh_belief_states of element.rb \n" +
                         "       new_state_to_apply = #{new_state_to_apply}  ")
            state_changed = an_element.set_belief_state(new_state_to_apply[:belief_state], a_user_id) 
          end
          
          unless additional_elements_beneath_with_a_belief_state_by_same_user.empty?
            ## this node has parts and those has connections to them with belief states by this user
            new_state_to_apply = evaluate_logical_value_of_elements(additional_elements_beneath_with_a_belief_state_by_same_user, a_user_id)
            #:belief_state
            logger.debug(">>>5c   #in refresh_belief_states of element.rb \n" +
                         "       new_state_to_apply = #{new_state_to_apply}  ")
            state_changed = an_element.set_belief_state(new_state_to_apply[:belief_state], a_user_id)
          end
          
        elsif an_element.is_a_connection?
          logger.debug(">>>4b   #in refresh_belief_states of element.rb \n" +
                       "       elements_beneath_with_a_belief_state_by_same_user = #{elements_beneath_with_a_belief_state_by_same_user.all} ")
          apply_believed_state_value_of_the_node_this_connection_connects_from = false
          
          ## elements_beneath_with_a_belief_state_by_same_user == the connections to this connection
          if elements_beneath_with_a_belief_state_by_same_user.empty?
            ##there are not connections to this connection, so use the belief state of the node that this connection connects from
            ##  (a node that must be present otherwise  additional_elements_beneath_with_a_belief_state_by_same_user.empty? == true
            ##  and it would have already been assigned the default 't' belief state )
            apply_believed_state_value_of_the_node_this_connection_connects_from = true
            
          else
            ##there are connections to this connection, so evaluate them.
            ## if there produce a state change to 't' or 'd' && :d_is_explicit == false, then apply the believed value from the node it connects from  
            new_state_to_apply = evaluate_logical_value_of_elements(elements_beneath_with_a_belief_state_by_same_user, a_user_id)
            logger.debug(">>>5b   #in refresh_belief_states of element.rb \n" +
                         "       new_state_to_apply = #{new_state_to_apply} ")
            if (new_state_to_apply[:belief_state] == 't') || ((new_state_to_apply[:belief_state] == 'd') && (new_state_to_apply[:d_is_explicit] == false))
              apply_believed_state_value_of_the_node_this_connection_connects_from = true
            else
              state_changed = an_element.set_belief_state(new_state_to_apply[:belief_state], a_user_id)
            end
            
          end
          
          if apply_believed_state_value_of_the_node_this_connection_connects_from
            logger.debug(">>>5c   #in refresh_belief_states of element.rb \n" +
                         "        additional_elements_beneath_with_a_belief_state_by_same_user.first = #{additional_elements_beneath_with_a_belief_state_by_same_user.first.id} \n" +
                         "        additional_elements_beneath_with_a_belief_state_by_same_user.first.belief_states = #{additional_elements_beneath_with_a_belief_state_by_same_user.first.belief_states} ")
            new_state_to_apply = additional_elements_beneath_with_a_belief_state_by_same_user.first.belief_states.first.believed_state
            logger.debug(">>>5d   #in refresh_belief_states of element.rb \n" +
                         "        new_state_to_apply to a connection, based solely on the belief state of the node it connects from = #{new_state_to_apply}  ")
            state_changed = an_element.set_belief_state(new_state_to_apply, a_user_id)
            
          end
          
        else
          raise "ERROR: have an element of type: #{an_element.element_type} but was expecting node or connection    #in refresh_belief_states of element.rb"
        end
      end
      
      logger.debug(">>>6   #in refresh_belief_states of element.rb \n" +
                   "       state_changed = #{state_changed}  for element.id = #{an_element.id} (a #{an_element.element_type}) ")
      return unless state_changed
      
      ## find if there are any non-question elements above me by any author
      elements_above_me_by_any_author = find_elements_above_an_element_by_any_author(an_element)
      logger.debug(">>>7   #in refresh_belief_states of element.rb \n" +
                   "       elements_above_me_by_any_author = #{elements_above_me_by_any_author}  ")
      
      return if elements_above_me_by_any_author.nil?
      ##iterate through each element above and propagate belief state
      elements_above_me_by_any_author.each {|element|
        refresh_belief_states(element, a_user_id, recursion_counter)
      }
      
    end
    
  end
  
  
  
private
    def self.find_connection_elements_beneath_an_element_with_a_belief_state_by_same_user(the_element, options = {}) ##options take  :element_user_id, :belief_user_id
      
      logger.debug(">>>   #in find_connection_elements_beneath_an_element_with_a_belief_state_by_same_user  of Element.rb \n"+
                   "1     the_element.id = #{the_element.id}   options = #{options}    \n"+
                   "1     options[:belief_user_id] = #{options[:belief_user_id]}  ")
      #elements_beneath = Element.robust__all_active_connections__to__an_element(the_element.id).active_belief_states

      if options[:element_user_id]
        if options[:belief_user_id]
          elements_beneath = Element.robust__all_active_connections__to__an_element_by_a_user(the_element.id, options[:element_user_id]).active_belief_states_by_user(options[:belief_user_id]).eager_load_belief_states
        else
          elements_beneath = Element.robust__all_active_connections__to__an_element_by_a_user(the_element.id, options[:element_user_id])#.eager_load_belief_states
        end
      else
        if options[:belief_user_id]
          logger.debug(">>>   #in find_connection_elements_beneath_an_element_with_a_belief_state_by_same_user  of Element.rb \n"+
                       "2     options[:belief_user_id] = #{options[:belief_user_id]}")
          elements_beneath = Element.robust__all_active_connections__to__an_element(the_element.id).active_belief_states_by_user(options[:belief_user_id]).eager_load_belief_states
          logger.debug(">>>   #in find_connection_elements_beneath_an_element_with_a_belief_state_by_same_user  of Element.rb \n"+
                       "3     elements_beneath =  #{elements_beneath.all}")
        else
          elements_beneath = Element.robust__all_active_connections__to__an_element(the_element.id)#.eager_load_belief_states
        end
      end
      return elements_beneath
    end
    
    
    def self.find_elements_beneath_the_part_elements_for_a_node_element_with_a_belief_state_by_same_user(the_element, options = {}) ##options take  :element_user_id, :belief_user_id
      logger.debug(">>>1   #in find_elements_beneath_the_part_elements_for_a_node_element_with_a_belief_state_by_same_user of elements.rb\n"+
                   "     ")
      if the_element.is_a_node? ## the_element is a node element which may have part elements associated with it.  
        ##find this nodes parts, and the elements beneath them
        if options[:element_user_id] ## specifies to only get parts for this element that were created by a particular user.
          if options[:belief_user_id]
            elements_beneath_the_elements_parts = Element.part_elements_for_element_id_by_user_id(the_element.id, options[:element_user_id]).robust__all_active_connections__to__an_element_by_a_user(the_element.id, options[:element_user_id]).active_belief_states_by_user(options[:belief_user_id]).eager_load_belief_states
          else
            elements_beneath_the_elements_parts = Element.part_elements_for_element_id_by_user_id(the_element.id, options[:element_user_id]).robust__all_active_connections__to__an_element_by_a_user(the_element.id, options[:element_user_id])
          end
        else
          if options[:belief_user_id]
            elements_beneath_the_elements_parts = Element.part_elements_for_element_id(the_element.id).robust__all_active_connections__to__an_element(the_element.id).active_belief_states_by_user(options[:belief_user_id]).eager_load_belief_states
          else
            elements_beneath_the_elements_parts = Element.part_elements_for_element_id(the_element.id).robust__all_active_connections__to__an_element(the_element.id)
          end
        end
        
        logger.debug(">>>2   #in find_elements_beneath_the_part_elements_for_a_node_element_with_a_belief_state_by_same_user of elements.rb\n"+
                     "     elements_beneath_the_elements_parts = #{elements_beneath_the_elements_parts.all} ")
        
        return elements_beneath_the_elements_parts
        
      end
      return nil
    end
    
    
    ##@TODO this feels wrong.  it feels like there might come a time when a connection can connect from another connection, rather than just from a node
    def self.find_the_node_element_beneath_a_connection_element_with_a_belief_state_by_same_user(the_element, options = {}) ##options take  :element_user_id, :belief_user_id
        logger.debug(">>>   #in find_the_node_element_beneath_a_connection_element_with_a_belief_state_by_same_user of elements.rb\n"+
                     "1     the_element = #{the_element.id} ")
      
      if the_element.is_a_connection? ## the_element is a connection element which may/should have a node element it connects from  
        if options[:element_user_id] ## specifies to only get parts for this element that were created by a particular user. 
          if options[:belief_user_id]
            the_node = Element.active.find_by_element_id(the_element.connects_from).by_user(options[:element_user_id]).nodes.active_belief_states_by_user(options[:belief_user_id]).eager_load_belief_states
          else
            the_node = Element.active.find_by_element_id(the_element.connects_from).by_user(options[:element_user_id]).nodes
          end
        else
          if options[:belief_user_id]
            the_node = Element.active.find_by_element_id(the_element.connects_from).nodes.active_belief_states_by_user(options[:belief_user_id]).eager_load_belief_states
          else
            the_node = Element.active.find_by_element_id(the_element.connects_from).nodes
          end
        end
        logger.debug(">>>   #in find_the_node_element_beneath_a_connection_element_with_a_belief_state_by_same_user of elements.rb\n"+
                     "2     the_node to return = #{the_node.all} ")
        return the_node
      end
      return nil
    end
    
    
    
    

    def self.find_elements_above_an_element_by_any_author(the_element, options = {:exclude_question_nodes => true}) ## @TODO options take :belief_user_id and
      logger.debug(">>>  the_element.element_type = #{the_element.element_type}      #in  find_elements_above_an_element_by_any_author  of Element.rb ")
      if the_element.is_a_node?
        ##find any connections from this
        return Element.robust__all_active_connections_from_an_element(the_element.id) if options[:exclude_question_nodes]
        return 'not yet implemented the find all connections from a node element including any question nodes'
        
      elsif the_element.is_a_connection? || the_element.is_a_part_element?
        ## only ever expecting this to be one node element
        unless the_element.connects_to.nil?
          a_node = Element.find(the_element.connects_to)
          return [a_node] unless (options[:exclude_question_nodes] && a_node.is_a_question_node?)
        end
        
      end
      
      return nil
    end
    
    
    
    def self.evaluate_logical_value_of_elements(array_of_elements_with_belief_states, a_user_id)
      sum = {:supports  => {:t => 0, :d => 0, :f => 0, :c => 0 },
             :questions => {:t => 0, :d => 0, :f => 0, :c => 0 },
             :refutes   => {:t => 0, :d => 0, :f => 0, :c => 0 }}
      
      logger.debug(">>>   array_of_elements_with_belief_states = #{array_of_elements_with_belief_states.all}  # in evaluate_logical_value_of_elements  of element.rb")
      logger.debug(">>>   array_of_elements_with_belief_states.belief_states = #{array_of_elements_with_belief_states.first.belief_states}  # in evaluate_logical_value_of_elements  of element.rb")
      
      ##iterate over all these elements and sum their logical support.
      #  so if they're a connection of type question with a belief state of 't' add it to the appropriate sum
      #  if they're a node or part then treat them as a "supports" connection
      array_of_elements_with_belief_states.each {|element|
        raise "data error detected in 'evaluate_logical_value_of_elements' of elements.rb  for belief states of element.id = #{element.id}  as it has multiple belief states =#{element.belief_states.all}" if element.belief_states.length > 1
        
        belief_state = element.belief_states.first.believed_state.to_sym
        logger.debug(">>>2   # in evaluate_logical_value_of_elements  of element.rb \n"+
                     "       belief_state = #{belief_state}  for element.id = #{element.id}  ")
        
        if element.is_a_connection?
          connection_subtype = element.subtype.to_sym
          sum[connection_subtype][belief_state] += 1 unless connection_subtype == :definition
        elsif element.is_a_node?
          sum[:supports][belief_state] += 1
        elsif element.is_a_part?
          raise "no expecting any parts to be in 'evaluate_logical_value_of_elements' of Element.rb"
        end
      }
      
      logic_value_of_elements = logical_sum(sum)
      
      logger.debug(">>>3   # in evaluate_logical_value_of_elements  of element.rb \n"+
                   "       logic_value_of_elements = #{logic_value_of_elements}  ")
      
      return logic_value_of_elements
    end
    
    
    
    ##is expecting input in the form of {:supports  => {:t => 0, :d => 0, :f => 0, :c => 0 },
    ##                                   :questions => {:t => 0, :d => 0, :f => 0, :c => 0 },
    ##                                   :refutes   => {:t => 0, :d => 0, :f => 0, :c => 0 }}
    def self.logical_sum(input)
      logger.debug(">>>   # in logical_sum  of element.rb \n" +
                   "      input = #{input}  ")
      
      logical_sum_result = {:belief_state => 'c', :d_is_explicit => true } ## :d_is_explicit refers to if the "don't know" outcome is due to it explicitly having 
      # one of more "questions" elements that are "t" and no "supports" or "refutes" with "t"  or whether there was an implicit "don't know" outcome due to there being no
      # "questions", "supports" or "refutes" with a "t" believed state
      
      ## now decide what the logical AND of these elements is.  Ignoring any 'c'(contradiction) belief states 
      if (input[:supports][:t] == 0)
        if (input[:questions][:t] == 0) 
          if (input[:refutes][:t] == 0)
            logical_sum_result[:belief_state] = 'd'
            logical_sum_result[:d_is_explicit] = false
          else
            logical_sum_result[:belief_state] = 'f'
          end
        else
          if (input[:refutes][:t] == 0)
            logical_sum_result[:belief_state] = 'd'
            logical_sum_result[:d_is_explicit] = true
          else
            #default belief_state of 'c'
          end
        end
      else
        if (input[:questions][:t] == 0) 
          if (input[:refutes][:t] == 0)
            logical_sum_result[:belief_state] = 't'
          else
            #default belief_state of 'c'
          end
        else
          #default belief_state of 'c'
        end
      end
      
      return logical_sum_result
    end
    
=begin  
    
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
      logger.warn(">>>   element.id = #{id},  content = #{content},  element_type = #{element_type}, is_a_connection? = #{is_a_connection?} #in check_content_is_valid of element.rb") 
      if is_a_node?
        if content.nil?
          errors.add(:content, "for a node must be > 6 characters  #in check_content_is_valid of element.rb")
        else
          if content.length < 1
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
          logger.warn(">>>  subtype for this 'part' had a value of '#{subtype}' but it should be left blank.  #in ensure_subtypes_are_valid of element.rb") 
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
      logger.debug(">>>  element type = #{element_type}, self.new_record? = #{self.new_record?}, self.is_a_part_element? = #{self.is_a_part_element?}.  #in ensure_presence_of_valid_parent_node_id_if_this_is_a_part_element of element.rb")
      ##check if this element is unsaved and of type == 'part'
      if self.new_record? && self.is_a_part_element?
        ## this is a new 'part' element, check if it has a valid parent node
        if id_of_parent_of_part_element.nil?
          ##fail due to lacking any id for it's parent node
          logger.debug(">>>  part element lacks _any_ parent node id   #in ensure_presence_of_valid_parent_node_id_if_this_is_a_part_element of element.rb")
          errors.add(:id_of_parent_of_part_element, "for this 'part' is absent  #in ensure_presence_of_valid_parent_node_id_if_this_is_a_part_element of element.rb")
        else
          parent_node = Element.find(id_of_parent_of_part_element)
          if parent_node.nil?
            ##fail due to lacking a valid id for it's parent
            logger.debug(">>>   'part' element lacks a valid id for it's parent node  #in ensure_presence_of_valid_parent_node_id_if_this_is_a_part_element of element.rb")
            errors.add(:id_of_parent_of_part_element, "is invalid as it is not present at all  #in ensure_presence_of_valid_parent_node_id_if_this_is_a_part_element of element.rb")
          else
            if parent_node.is_a_node?
              return true
            else
              logger.debug(">>>   'part' element lacks a valid id for it's parent node  #in ensure_presence_of_valid_parent_node_id_if_this_is_a_part_element of element.rb")
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





