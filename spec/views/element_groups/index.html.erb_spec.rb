require 'spec_helper'

describe "element_groups/index.html.erb" do
  before(:each) do
    assign(:element_groups, [
      stub_model(ElementGroup),
      stub_model(ElementGroup)
    ])
  end

  it "renders a list of element_groups" do
    render
  end
end
