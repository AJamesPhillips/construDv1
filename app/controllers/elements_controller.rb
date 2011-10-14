class ElementsController < ApplicationController
  
  before_filter :authenticate,  :only => :create
  #before_filter :authorized_user, :except => :create
  
  
  def index ## Search
    @elements = Element.search(params[:search])
    @element = Element.new() if @elements.empty?
    logger.debug ">>> element = #{@element.attributes}    # in 'index' of 'ElementsController'" if @elements.empty?
    
    render 'pages/index'
  end
  
  
  
  
  
  def create_multiple
    @elements = []
    
    ##swap the element in params[:elements][0] with params[:elements][2] if the connection direction is 'backwards'
    if params[:elements][1][:connection_direction] == 'forwards'
      ##do nothing
    elsif params[:elements][1][:connection_direction] == 'backwards'
      ##swap the element in params[:elements][0] with params[:elements][2]
      params[:elements].reverse!
    else
      logger.error ">>>  error, params[:connection_direction] = #{params[:connection_direction]} which is not 'forwards' or 'backwards'  #in create_multiple of elements_controller"
    end
    
    
    def prepare_node_or_parts_for_creation(index)
      ##check if the element already exists
      @elements[index] = Element.find(params[:elements][index][:id]) unless params[:elements][index][:id].empty?
      
      if @elements[index].nil?  ## the element doesn't exist so remove the id from the params, build then save the element
        params[:elements][index].delete(:id)
        @elements[index] = current_user.elements.build(params[:elements][index])
      else
        ## do nothing as the element already exists
      end
    end
    prepare_node_or_parts_for_creation(0)
    prepare_node_or_parts_for_creation(2)
    logger.debug ">>>   after prepare_node_or_parts_for_creation   @elements = #{@elements}   #in create_multiple of elements_controller"
    
    
    ##prepare connection for creation
    params[:elements][1].delete(:id)
    params[:elements][1][:content] = nil
    @elements[1] = current_user.elements.build(params[:elements][1])
    
    
    ##save elements[0] and elements[2], then use their ids to populate elements[1].content for the connections
    ## finally, create the necessary iels
    
    logger.debug ">>> @elements[0].id_of_parent_of_part_element = #{@elements[0].id_of_parent_of_part_element}, @elements[2].id_of_parent_of_part_element = #{@elements[2].id_of_parent_of_part_element}   #in create_multiple of elements_controller"
    
    if @elements[0].save && @elements[2].save
      ##set up the connection element's content
      logger.debug ">>>     @elements[1].content = #{@elements[1].content}  before   #in create_multiple of elements_controller"
      @elements[1].content = "#{@elements[0].id},#{@elements[2].id}"
      logger.debug ">>>     @elements[1].content = #{@elements[1].content}  after    #in create_multiple of elements_controller"
      
      ## save the connection element
      if @elements[1].save
        ##make the necessary iels
        ##check @elements[0] and @elements[2] for id_of_parent_of_part_element
        logger.debug ">>> @elements[0].id_of_parent_of_part_element = #{@elements[0].id_of_parent_of_part_element}, @elements[2].id_of_parent_of_part_element = #{@elements[2].id_of_parent_of_part_element}   #in create_multiple of elements_controller"
        
        ##new_iel_link for element[0] to it's parent node, if it's a part element
        if @elements[0].is_a_part_element? && !@elements[0].id_of_parent_of_part_element.nil?
          parent_element = Element.find(@elements[0].id_of_parent_of_part_element)
          @elements[0].make_inter_element_link(parent_element)
        end
        
        if @elements[2].is_a_part_element? && !@elements[2].id_of_parent_of_part_element.nil?
          parent_element = Element.find(@elements[2].id_of_parent_of_part_element)
          @elements[2].make_inter_element_link(parent_element)
        end
        
        @elements[0].make_inter_element_link(@elements[1])
        @elements[1].make_inter_element_link(@elements[2])

        ##update the belief states
        @elements[2].refresh_belief_states
        
      else
        logger.error ">>> @elements[1].save  did not work  #in create_multiple of elements_controller"
      end
      
    else
      logger.error ">>> @elements[0].save && @elements[2].save  did not work  #in create_multiple of elements_controller"
    end
    
    
    respond_to do |format|
      format.html
      format.js
    end
  end
  
  
  
  
  
  
  
  
  
  def create
    @element = current_user.elements.build(params[:element])
    logger.debug ">>> @element.attributes = #{@element.attributes}    # in 'index' of 'ElementsController'"
    logger.debug "||| @element.errors = #{@element.errors}    # in 'index' of 'ElementsController'"
    logger.debug ">>> @element.valid? = #{@element.valid?}    # in 'index' of 'ElementsController'"
    logger.debug "||| @element.errors = #{@element.errors}    # in 'index' of 'ElementsController'"
    if @element.save
      logger.debug ">>> @element.save = true    # in 'index' of 'ElementsController'"
      flash[:success] = "New Discussion Element Created"
      @element.refresh_belief_states
      
      redirect_to @element
    else
      logger.debug ">>> @element.save = false    # in 'index' of 'ElementsController'"
      flash[:warning] = "An error occured"
      @elements = []
      render 'pages/index' #root_path
    end
  end
  
  
  
  
  
  def destroy    
    @element.destroy
    redirect_to root_path
  end
  
  
  
  def update
=begin
    if @activity.update_attributes(params[:activity])
      flash[:success] = "Activity updated successfully"
      redirect_to root_path
    else
      flash[:error] = "Activity failed to update successfully"
      logger.debug ">>>> in '@activity.update_attributes failed' part of 'update' of 'activities_controller'"
      logger.debug "@activity = #{@activity}"
      set_start_end_time_to_local_now
      @start_datetime_of_range =  @start_datetime_of_today
      @end_datetime_of_range =    @end_datetime_of_today
      render 'show'
    end
=end
  end
  
  
  
  def show
    ## remove any author ids from the request, e.g. takesindexparams[:id] = "3-0,1-4authors=5,4"  and returns params[:id] = "3-0,1-4"  and  @author_ids = [5,4]
    @author_ids = params[:id].slice!(/authors=(.)*/)
    if @author_ids.nil?
      @author_ids = []
    else
      @author_ids = @author_ids.sub(/authors=/,'').split(',')
    end
    
    
    
    ## initial check for if it's a json or html request.
    ## if html request, then save root_element as the element requested
    if request.format == 'text/html'
      ##check there's only one id being requested:
      if !(params[:id].include? ',')
        @root_element_id = params[:id].to_i
        @degree_of_view = 0
        @degree_of_view = params[:id].split('-')[1].to_i if params[:id].include? '-'
        @element_ids = [@root_element_id]
      else
        ## there is more than one id being requested, remove any "degrees_of_view"  i.e. make elements/4-3,2-3,87-2 into 4,2,87
        @degree_of_view = 0
        params[:id].gsub!(/-[^,]*/,'')
        logger.debug ">>>  params[:id].gsub!(/-[^,]*/,'') = #{params[:id]}  # in show of elements_controller"
        @element_ids = params[:id].split(',')
        @root_element_id = @element_ids[0]  ## arbitrarily set the root_element_id as the first id.
        
      end
      logger.debug ">>>  @root_element_id = #{@root_element_id}  # in show of elements_controller"
      @root_element = Element.find(@root_element_id)
      ##quickly test that this isn't a request for a question element, else modify the request to have 6 degrees of view
      logger.debug ">>>   @root_element.is_a_question_node? = #{@root_element.is_a_question_node?}  # in show of elements_controller"
      if @root_element.is_a_question_node?
        @degree_of_view = 6
        #params[:id] = @root_element_id.to_s + '-6';
      end
      logger.debug ">>>  params[:id] = #{params[:id]}  # in show of elements_controller"
      
    elsif request.format == 'application/json'
      @degree_of_view = 0
      if (params[:id].include? ',')
        ## there is more than one id being requested, remove any "degrees_of_view"  i.e. make elements/4-3,2-3,87-2 into 4,2,87
        params[:id].gsub!(/-[^,]*/,'')
        @element_ids = params[:id].split(',')
        
      else
        @element_ids = [params[:id].to_i]
        @degree_of_view = params[:id].split('-')[1].to_i if (params[:id].include? '-')
      end
    end
    
    
    

    
    ## @TODO SO BAD.. Absolutely Bags of room here for optimising this...(I hope).  I think this needs to have more SELECT IN  SQL queries, though see how it's currently being implemented... I suspect it will be as many separate SELECT queries.
    ## @TODO check for security holes, what if someone puts something crazy as an element id, it will be taken as a strong and converted into a symbol that's latter used to find elements_by_id
    
    logger.debug ">>>  request.format = #{request.format},  @element_ids = #{@element_ids},  @degree_of_view = #{@degree_of_view},  @root_element_id = #{@root_element_id}  # in show of elements_controller"
    @element_ids.uniq!
    
    @degree_of_view = 6 if @degree_of_view > 6
    @degree_of_view = 0 if @degree_of_view < 0
    @degree_of_view += 1
    @elements = []
    @element_links = []
    @element_ids.each {|element_id|
      element = Element.find(element_id)
      inter_element_links = element.inter_element_links
      elements = [element]
#=begin      
      @degree_of_view.times {
        inter_element_links.each {|link| elements.concat(link.elements) } #unless inter_element_links.empty
        elements.uniq!
        elements.each {|element| inter_element_links.concat(element.inter_element_links) } #unless elements.empty?
        break if (inter_element_links.uniq!.nil?)   ## saves time when element_degree is large but element(s) aren't connected to enough so it's not going anywhere.
      }
#=end      
      @elements.concat elements
      @elements.uniq!
      @element_links.concat inter_element_links
      @element_links.uniq!
    }
    
    logger.debug ">>>  @elements = #{@elements},  @element_links = #{@element_links}  # in show of elements_controller"
    
    
=begin    
    #d# 
    logger.debug ">>>  params = #{params}  # in show of elements_controller"
    
    @element_ids = {}
    
    #d# 
    logger.debug ">>>  params[:id] = #{params[:id]}  # in show of elements_controller"
    ## convert element ids in params from single or comma seperated string into array of numbers
    array_of_ids_and_their_degrees_of_view = params[:id].split(',')
    
    array_of_ids_and_their_degrees_of_view.each {|element_id_and_degree|
      element_id_and_degree = element_id_and_degree.split('-')
      element_id = element_id_and_degree[0].to_i.to_s.to_sym  ##added the .to_i to filter any crap coming in that's not an integer
      element_id_and_degree[1] ||= 0
      element_degree = element_id_and_degree[1].to_i
      
      current_degrees_of_freedom_for_element_id = @element_ids[element_id]
      if current_degrees_of_freedom_for_element_id.nil?
        @element_ids[element_id] = element_degree
      else
        @element_ids[element_id] = element_degree if current_degrees_of_freedom_for_element_id < element_degree
      end
      
      ##check the degrees of view are not greater than the maximum
      @element_ids[element_id] = 6 if @element_ids[element_id] > 6
      @element_ids[element_id] = 0 if @element_ids[element_id] < 0
    }
    
    #d# 
    logger.debug ">>>  @element_ids = #{@element_ids}  # in show of elements_controller"
    

    
    
    ##now go through each element_id (the keys) of @element_ids and loop over, collecting their iel_linked elements
    @elements = []
    @element_links = []


    @element_ids.each {|element_id, element_degree|
      elements = [Element.find(element_id)]
      inter_element_links = elements[0].inter_element_links
      
      
      
      element_degree.times {
        inter_element_links.each {|link| elements.concat(link.elements) } #unless inter_element_links.empty
        elements.uniq!
        elements.each {|element| inter_element_links.concat(element.inter_element_links) } #unless elements.empty?
        break if (inter_element_links.uniq!.nil?)   ## saves time when element_degree is large but element(s) aren't connected to enough so it's not going anywhere.
      }
      
      logger.debug ">>>  elements = #{elements.map {|element| element.id }}  # in show of elements_controller"
      logger.debug ">>>  @elements = #{@elements.map {|element| element.id }}  # in show of elements_controller"
      logger.debug ">>>  inter_element_links = #{inter_element_links.map {|iel_link| "#{iel_link.element1_id} - #{iel_link.element2_id}, "}}  # in show of elements_controller"
      logger.debug ">>>  @element_links = #{@element_links.map {|iel_link| "#{iel_link.element1_id} - #{iel_link.element2_id}, "}}  # in show of elements_controller"
      
      @elements.concat elements
      @elements.uniq!
      @element_links.concat inter_element_links
      @element_links.uniq!
      #d# 
      logger.debug ">>>  @elements = #{@elements.map {|element| element.id }}  # in show of elements_controller"
      logger.debug ">>>  @element_links = #{@element_links.map {|iel_link| "#{iel_link.element1_id} #{iel_link.element2_id}"}}  # in show of elements_controller"
    }
    
    logger.debug ">>>  @elements = #{@elements}  # in show of elements_controller"
    logger.debug ">>>  @element_links = #{@element_links}  # in show of elements_controller"
    
    ## take each element and get it's id value into an array_of_element_ids
    @array_of_element_ids = @elements.map {|element| element.id }
    
=end
    
    
    @array_of_element_ids = @elements.map {|element| element.id }
    logger.debug ">>>  @array_of_element_ids = #{@array_of_element_ids}  # in show of elements_controller"
    logger.debug ">>>  @elements = #{@elements.map {|element| element.id }}  # in show of elements_controller"
    
    
    
    ## get the believed truth states for each discussion element
    @belief_states = BeliefState.not_archived.find_all_by_user_id_and_element_id(@author_ids, @array_of_element_ids) unless (@author_ids.empty? || @array_of_element_ids.empty?)
    @belief_states = BeliefState.not_archived.find_all_by_element_id(@array_of_element_ids) unless @array_of_element_ids.empty?

    respond_to do |format|
      format.html 
      format.json
      #format.js
    end
  end
  
  
  
  private
    def authorized_user
      @element = Element.find(params[:id])
      redirect_to root_path unless current_user?(@element.user)    
    end
  
end
