import type { LoaderFunction } from "remix";
import { useLoaderData, json, Link } from "remix";
import { supabase } from "~/util/auth";
import { useSupabaseUser } from "~/context/supabase";

type IndexData = {};

export let loader: LoaderFunction = async ({ request }) => {
  const db = await supabase(request);

  const { data, error } = await db.from("recipes").select("*");

  return json({ recipes: data });
};

interface IIndexViewProps {}

const View = (props: IIndexViewProps) => {
  const user = useSupabaseUser();

  return (
    <>
      <ul>
        {props.recipes.map((recipe) => (
          <Link to={`/recipes/${recipe.slug}`}>
            <li>{recipe.name}</li>
          </Link>
        ))}
      </ul>
      {user != null && (
        <Link
          to="recipes/new"
          className="block mt-12 font-bold hover:underline"
        >
          Add a Recipe
        </Link>
      )}
    </>
  );
};

export default function Index() {
  let { recipes } = useLoaderData<IndexData>();

  return <View recipes={recipes} />;
}
