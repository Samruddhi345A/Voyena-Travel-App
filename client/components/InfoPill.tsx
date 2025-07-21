
const InfoPill = ({text,image}:InfoPillProps) => {
  return (
    <figure className="info-pill">
      {image && <img src={image} alt={text} className="size-4" />}
      <figcaption >{text}</figcaption>
    </figure>
    
  )
}

export default InfoPill