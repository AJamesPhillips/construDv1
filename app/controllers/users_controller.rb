class UsersController < ApplicationController
  
  before_filter :authenticate,      :except => [:show, :new, :create]
  
  before_filter :correct_user,      :only => [:edit, :update]
  before_filter :admin_user,        :only => [:destroy, :index_of_admins]
  before_filter :a_signed_in_user,  :only => [:new, :create]
  
  
  
  def index    
    @title = "All users"    
    @users = User.paginate(:page => params[:page])  ##  params[:page], is generated automatically by the 'will_paginate' gem.
  end  
  
  
  def new
    @title = "Sign up"
    @user = User.new
  end
  
  
  def show
    @title = "User Info"
    @user = User.find(params[:id])
  end
  
  
  def index_of_admins
    @title = "All admins"    
    @users = User.admin.paginate(:page => params[:page])  ##  params[:page], is generated automatically by the 'will_paginate' gem.
    render :index
  end
  
  
  def create
    @user = User.new(params[:user])
    if @user.save
      #save is successful
      sign_in @user
      flash[:success] = "Welcome to Constructive Discussion"
      @title = "#{@user.name} profile"
      redirect_to @user  ## is equivalent to   'redirect_to user_path(@user)'
    else
      #save is unsuccessful
      @title = "Sign up"
      @user.errors.full_messages.each do |error_msg|
        if error_msg =~ /Password/
          @user.password = ""  ## will only reset the password entered into the field when the form fails due to error with password
          @user.password_confirmation = ""  
        end
      end
      render :new
    end
  end
  
  
  def edit
    @title = "Editing #{@user.name}"
  end
  
  
  def update    
    if @user.hasSamePassword?(params[:old_password])
      ##if the user just wants to change their user name or email, they won't enter the password so, set this to the 'old_password' value and just reassign in. 
      params[:user][:password] = params[:user][:password_confirmation] = params[:old_password]  if params[:password].nil?

      if @user.update_attributes(params[:user])
        flash[:success] = "Profile updated."      
        redirect_to @user    
      else
        @title = "Edit user"
        render 'edit'
      end
    else
      flash[:error] = "Enter current correct password into 'Old Password' field"
      @title = "Edit user"
      render 'edit'
    end
      
  end
  
  
  def destroy
    the_user_selected_for_destruction = User.find(params[:id])
    if the_user_selected_for_destruction == current_user
      flash[:error] = "You cannot delete yourself."
    elsif the_user_selected_for_destruction.admin?
      flash[:error] = "You cannot delete another admin."
    else
      the_user_selected_for_destruction.destroy 
      flash[:success] = "User destroyed."   
    end
    #redirect_back_or(users_path)
    redirect_to users_path
  end
  
  
  
  private    
    def correct_user
      @user = User.find(params[:id])   
      logger.debug ">>> current_user?(@user) = #{current_user?(@user)}, @user = #{@user}, params = #{params}  #in correct_user of users_controller"
      redirect_to(root_path) unless current_user?(@user)
    end
    
    
    def admin_user      
      unless current_user.admin?
        flash[:error] = "Please sign in as an admin to proceed"
        redirect_to(root_path)
      end
    end
    
    
    def a_signed_in_user
      if signed_in?
        flash[:error] = "You're already signed in.  Please sign out first."
        redirect_to(root_path)
      end
    end

  
end

