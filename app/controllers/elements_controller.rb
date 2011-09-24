class ElementsController < ApplicationController
  
  before_filter :authenticate,  :only => :create
  #before_filter :authorized_user, :except => :create
  
  
  def index ## Search
    @elements = Element.search(params[:search])
    @element = Element.new() if @elements.empty?
    logger.debug ">>> element = #{@element.attributes}    # in 'index' of 'ElementsController'" if @elements.empty?
    
    render 'pages/index'
  end
  
  
  
  def create
=begin
    unless params[:element][:planned_activity_states_attributes].nil?  ## implementation as of 2011-08-07 of the _activity_form partial will resutl in this being nil.
      params[:activity][:planned_activity_states_attributes].map do |planned_state|
        # => n.b.  planned_state = ["0", {"planned_state_type"=>"Running", "planned_behav... etc
        planned_state[1][:planned_behaviour_time] = planned_state[1][:planned_behaviour_time].to_i * 60  ## converts time in minutes into time in seconds.
        planned_state
      end
    end
=end
    
    
    @element = current_user.elements.build(params[:element])
    logger.debug ">>> element = #{@element.attributes}    # in 'index' of 'ElementsController'"
    if @element.save
      flash[:success] = "New Discussion Element Created"
      redirect_to @element
    else
      flash[:warning] = "An error occured"
      #@elements = current_user.elements.paginate(:page => params[:page])  ## @TODO is there a better way?
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
    ## @TODO SO BAD.. Absolutely Bags of room here for optimising this...(I hope).  I think this needs to have more SELECT IN  SQL queries, though see how it's currently being implemented... I suspect it will be as many separate SELECT queries.
    ## @TODO check for security holes, what if someone puts something crazy as an element id, it will be taken as a strong and converted into a symbol that's latter used to find elements_by_id
    
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
      logger.debug ">>>  inter_element_links = #{inter_element_links.map {|iel_link| "#{iel_link.element1_id} #{iel_link.element2_id}"}}  # in show of elements_controller"
      logger.debug ">>>  @element_links = #{@element_links.map {|iel_link| "#{iel_link.element1_id} #{iel_link.element2_id}"}}  # in show of elements_controller"
      
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
    
    
    @array_of_ids = @elements.map {|element| element.id }
    logger.debug ">>>  @array_of_ids = #{@array_of_ids}  # in show of elements_controller"
    
    #@array_of_ids.uniq!
=begin
    #d# 
    
    
    ## now go through each id in @array_of_ids, find it's requested degree_of_views (there maybe more than one), choose the largest, make sure this isn't over the 
    ##  maximum limit of 6, then iterate over this, collecting all elements and iel_links
    @array_of_ids.each
    
    
    
    @elements = @array_of_ids.map {|id| Element.find(id) }  
    #d# logger.debug ">> @elements.each.id = #{@elements.map(&:id).join(', ') } # in show of elements_controller.rb"
    @element_links = @elements.map {|element| element.inter_element_links }
    @element_links.flatten!.uniq!
    @elements = @element_links.map {|link| link.elements } unless @element_links.empty?
    ## now get all inter_element_links for the new elements.
    @elements.flatten!
    #d# logger.debug ">> @elements.each.id = #{@elements.map(&:id).join(', ') } # in show of elements_controller.rb"
    @elements.uniq!
    #d# logger.debug ">> @elements.uniq! = #{@elements.map(&:id).join(', ') } # in show of elements_controller.rb"
    
    @element_links = @elements.map {|element| element.inter_element_links }
    @element_links.flatten!
    #d# logger.debug ">> @element_links = #{@element_links.map {|iel_link| "#{iel_link.element1_id}_#{iel_link.element2_id}"}.join(', ') } # in show of elements_controller.rb"
    @element_links.uniq!
    #d# logger.debug ">> @element_links.uniq! = #{@element_links.map {|iel_link| "#{iel_link.element1_id}_#{iel_link.element2_id}"}.join(', ') } # in show of elements_controller.rb"
    
    
    #logger.debug ">> @element = #{@element.attributes} #in index of elements_controller"
    #logger.debug ">> @element.inter_element_links1 = #{@element.inter_element_links1} #in index of elements_controller"
    #logger.debug ">> @element.inter_element_links2 = #{@element.inter_element_links2} #in index of elements_controller"
    #logger.debug ">> @element_links = #{@element_links} #in index of elements_controller"
    
    #@neighbouring_elements = @elements[0].elements
    #logger.debug ">> @neighbouring_elements.class = #{@neighbouring_elements.class} #in index of elements_controller"
=end    
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
