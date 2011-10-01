# == Schema Information
# Schema version: 20110622222416
#
# Table name: users
#
#  id         :integer         not null, primary key
#  name       :string(255)
#  email      :string(255)
#  created_at :datetime
#  updated_at :datetime
#

class User < ActiveRecord::Base
  
  attr_accessor :password, :secret_code
  attr_accessible :name, :email, :password, :password_confirmation, :secret_code   #n.b. 'passwordConfirmation' doesn't work, it NEEDS to be 'password_confirmation'
  ## Explicitly defining accessible attributes is crucial for good site security. 
  ## If we omitted the attr_accessible list in this User model (or foolishly added 
  ## :admin to the list), a malicious user could send a PUT request as follows:
  ##
  ##     put /users/17?admin=1
  ##
  ## This request would make user 17 an admin, which could be a potentially serious security breach. 
  ## Because of this danger, it is a good practice to define attr_accessible for every model.

  has_many :elements
  has_many :belief_states
  
=begin  
  has_many :microposts,            :dependent => :destroy
  has_many :relationships,         :foreign_key => "follower_id", 
                                   :dependent => :destroy
  has_many :following, :through => :relationships, :source => :followed  ## (a grammatically nicer alternative to
  ##  has_many :followeds, :through => :relationships  )  This uses the :source parameter to explicitly tell Rails that the source of the following array is the set of followed ids.
  has_many :reverse_relationships, :foreign_key => "followed_id",                                   
                                   :class_name => "Relationship",  ##have to include the class name for this association, otherwise Rails will look for a ReverseRelationship class, which doesn’t exist.
                                   :dependent => :destroy
  has_many :followers, :through => :reverse_relationships  ## we can actually omit ', :source => :follower'   from    'has_many :followers, :through => :reverse_relationships, :source => :follower'
=end   
  
  maxUserNameLengthInCharacters = 50
  validates :name, :presence => true,
                   :length => { :maximum => maxUserNameLengthInCharacters },
                   :uniqueness => { :case_sensitive => false }
  
  
  emailRegex = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i
  validates :email, :presence => true,
                    :format => { :with => emailRegex },
                    :uniqueness => { :case_sensitive => false } 

                  
  #Automatically create the virtual attribute 'password_confirmation'
  validates :password, :presence => true,
                       :confirmation => true,
                       :length => {:within => 6..40}
  
  validate :ensure_secret_code_is_correct, :on => :create
  before_save :encryptPassword
  
 
  scope :admin, where(:admin => true)   ## from Ch 12.3.3   An Alterantive to doing ??? I dunno, some search that would grab all admins.
                                        ## This allows the call 'User.admin' used in the 'index_of_admins' of 'users_controller.rb'
  
  
  def hasSamePassword?(submittedPassword)
    encrypted_password == encryptUsingSalt(submittedPassword)
  end

  
  def self.authenticate(params)
    user = find_by_email(params[:email])
    return nil if user == nil
    return user if user.hasSamePassword?(params[:password])
    ##default, if user email is valid but passwords is not, we will implicitly return 'nil' 
  end
  
  
  def self.authenticate_with_salt(id, cookie_salt)
    user = find_by_id(id)    
    (user && user.salt == cookie_salt) ? user : nil  
  end
  
  
=begin 
  def follow!(followed)    
    relationships.create!(:followed_id => followed.id)  ##equivlant to including the User class with   'self.relationships.create!(:followed_id => followed.id)'  
  end
    
  def following?(followed)    
    relationships.find_by_followed_id(followed)  
  end  
  
  def unfollow!(followed)    
    relationships.find_by_followed_id(followed).destroy  
  end
  
  
  
  def feed    # This is preliminary. See Chapter 12 for the full implementation.    
    Micropost.from_users_followed_by(self)
    
    #OLDER# Micropost.where("user_id = ?", id)  ## The question mark ensures that the 'id' is properly escaped before 
                                                ##  being included in the underlying SQL query, thereby avoiding a 
                                                ##  serious SQL injection security hole.  The id attribute here though
                                                ##  is just an integer, so there is no danger, but always escaping 
                                                ##  variables injected into SQL statements is a very good habit.
  end

=end


  private
  def encryptPassword
    self.salt = makeSalt if new_record?
    self.encrypted_password = encryptUsingSalt(password)  ## 'password' is equivalent to typing 'self.password'
  end
 
  def makeSalt
    secureHash("#{Time.now.utc}--#{password}")
  end
  
  def secureHash(stringToEncrypt)
    Digest::SHA2.hexdigest(stringToEncrypt)
  end
  
  
  def encryptUsingSalt(passwordToEncrypt)
    secureHash("#{salt}--#{passwordToEncrypt}")
  end
 
 
  def ensure_secret_code_is_correct
    require 'secret_code'
    #logger.debug " secret_code = #{secret_code}  # in 'ensure_secret_code_is_correct' of 'user.rb' "
    #logger.debug " Digest::SHA2.hexdigest(secret_code) = #{Digest::SHA2.hexdigest(secret_code)}  # in 'ensure_secret_code_is_correct' of 'user.rb' "
    #logger.debug " the_secret_code = #{the_secret_code}  # in 'ensure_secret_code_is_correct' of 'user.rb' "
    if secret_code.nil? || secret_code.empty? 
      errors.add(:secret_code, "for #{description_of_use_for_secret_code} can't be blank.")
    else
      errors.add(:secret_code, " is incorrect for #{description_of_use_for_secret_code}.")  unless Digest::SHA2.hexdigest(secret_code) == the_secret_code
    end
  end
  
end
