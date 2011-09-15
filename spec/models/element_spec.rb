require 'spec_helper'

describe Element do
  pending "add some examples to (or delete) #{__FILE__}"
end

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

