require 'spec_helper'

describe "element_groups/new.html.erb" do
  before(:each) do
    assign(:element_group, stub_model(ElementGroup).as_new_record)
  end

  it "renders new element_group form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form", :action => element_groups_path, :method => "post" do
    end
  end
end
