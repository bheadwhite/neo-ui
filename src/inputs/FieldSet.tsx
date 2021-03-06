import React from "react";
import styled from "styled-components";

const StyledFieldSet = styled.fieldset`
  border: 2px solid rgba(190, 200, 215, 0.45);
  border-radius: 8px;
  font-family: Verdana, Geneva, sans-serif;
  font-size: 16px;
  color: rgba(100, 110, 140, 0.8);
  padding: 24px;
`;

export interface Props {
  name: string;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode | React.ReactNode[];
}

const FieldSet = React.forwardRef<HTMLFieldSetElement, Props>(
  ({ name, className, style, children }: Props, ref) => {
    return (
      <StyledFieldSet ref={ref} className={className} style={style}>
        <legend>{name}</legend>
        {children}
      </StyledFieldSet>
    );
  }
);

export default FieldSet;
