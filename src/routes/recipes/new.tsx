import { useState } from "react";
import type { ActionFunction } from "remix";
import { redirect } from "remix";
import { supabase } from "~/util/auth";

interface IIndexViewProps {}

export let action: ActionFunction = async ({ request }) => {
  const db = await supabase(request);
  const body = await request.formData();

  const { data, error } = await db
    .from("recipes")
    .insert({
      name: body.get("name") as string,
      ingredients: body.get("ingredients") as string,
      instructions: body.get("instructions") as string,
    })
    .single();

  return redirect(`/recipes/${data?.slug}`);
};

const View = (props: IIndexViewProps) => {
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");

  return (
    <div className="w-full">
      <form method="post">
        <section>
          <label>
            <h2 className="text-2xl font-bold my-4">Name</h2>
            <input name="name" />
          </label>
        </section>
        <label>
          <h2 className="text-2xl font-bold my-4">Ingredients</h2>
          <textarea
            className="w-full"
            name="ingredients"
            value={ingredients}
            onChange={(event) => setIngredients(event.target.value)}
            rows={ingredients.split("\n").length}
          />
        </label>
        <label>
          <h2 className="text-2xl font-bold my-4">Instructions</h2>
          <textarea
            className="w-full"
            name="instructions"
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            rows={instructions.split("\n").length}
          />
        </label>
        <button className="bg-white px-4 py-2 mt-4" type="submit">
          Create
        </button>
      </form>
    </div>
  );
};

export default function Index() {
  return <View />;
}
