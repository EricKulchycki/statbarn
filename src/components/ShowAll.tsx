import { Button } from '@heroui/react'

type ShowAllProps = {
  showAll: boolean
  setShowAll: (show: boolean) => void
}

export function ShowAll({ showAll, setShowAll }: ShowAllProps) {
  return (
    <>
      {!showAll && (
        <Button
          variant="flat"
          color="primary"
          className="mt-4"
          onPress={() => setShowAll(true)}
        >
          See More
        </Button>
      )}
      {showAll && (
        <Button
          variant="flat"
          color="secondary"
          className="mt-4"
          onPress={() => setShowAll(false)}
        >
          Show Less
        </Button>
      )}
    </>
  )
}
