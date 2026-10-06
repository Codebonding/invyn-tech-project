import { Component } from "react";

/** The character is decorative: if WebGL fails, the course carousel keeps working. */
export default class CharacterBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() {}
  render() { return this.state.failed ? null : this.props.children; }
}