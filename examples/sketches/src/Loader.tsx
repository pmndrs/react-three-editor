import styled, { keyframes } from 'styled-components'

const LoaderKeyframes = keyframes`
from {
    transform: rotate(0deg);
}
to {
    transform: rotate(360deg);
}
`

export const Loader = styled.div`
    position: fixed;
    left: calc(50% - 25px);
    top: calc(50vh - 50px);
    width: 50px;
    height: 50px;
    border: 3px solid rgba(0, 0, 0, 0);
    border-top: 3px solid #fff;
    border-radius: 50%;
    animation: ${LoaderKeyframes} 1s ease infinite;
`
