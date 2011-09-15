class ApplicationController < ActionController::Base
  protect_from_forgery
  include SessionsHelper

=begin
  def method_missing(m, *args, &block)
    Rails.logger.error(m)
    flash[:error] = "Sorry, we can't find that because it appears not to exist."
    # or redirect_to :controller=>"errors", :action=>"error_404"
    redirect_to root_path
    #render '/shared/errors/bad_record'
  end
  
  Rails.logger.debug("in 'ApplicationController'   Rails.application.config.consider_all_requests_local = #{Rails.application.config.consider_all_requests_local}")
  Rails.logger.info("in 'ApplicationController'   Rails.application.config.consider_all_requests_local = #{Rails.application.config.consider_all_requests_local}")
  
  unless Rails.application.config.consider_all_requests_local
    rescue_from Exception, :with => :method_missing
    rescue_from ActiveRecord::RecordNotFound, :with => :method_missing
    rescue_from AbstractController::ActionNotFound, :with => :method_missing
    rescue_from ActionController::RoutingError, :with => :method_missing
    rescue_from ActionController::UnknownController, :with => :method_missing
    rescue_from ActionController::UnknownAction, :with => :method_missing
    rescue_from ActiveRecord::RecordNotFound, :with => :method_missing
    ## Declare exception to handler methods   from:  http://ryandaigle.com/articles/2007/9/24/what-s-new-in-edge-rails-better-exception-handling
    #rescue_from(ActiveRecord::RecordNotFound) { |e| render :file => '/shared/errors/bad_record' }
    rescue_from NoMethodError, :with => proc { |e| render :text => e.message }
=end


end
