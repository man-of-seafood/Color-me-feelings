import React from 'react';

class NewsListEntry extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      hover: false,
    };
  } 

  onMouseEnter() {
    this.setState({
      hover: true,
    });
  }
  
  onMouseLeave() {
    this.setState({
      hover: false,
    });
  }

  onClick() {
    window.open(this.props.article.source, '_blank');
  }

  render() {

    const entryStyle = {
      backgroundColor: this.state.hover
        ? `black`
        : `red`,
    };

    return (
      <div style={entryStyle}
        onMouseEnter={this.onMouseEnter.bind(this)}
        onMouseLeave={this.onMouseLeave.bind(this)}
        onClick={this.onClick.bind(this)}
      >
        <h3>{this.props.article.title}</h3>
        <p>{this.props.article.source}</p>
      </div>
    );

  }

} 

export default NewsListEntry;
