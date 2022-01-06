import { LoaderFunction, useParams } from "remix";
import { useLoaderData, json, Link } from "remix";
import { supabase } from "~/util/auth";

type IndexData = {};

export let loader: LoaderFunction = async ({ request, params }) => {
  const db = await supabase(request);

  const { data, error } = await db
    .from("recipes")
    .select("*, user:user_id(*)")
    .match({ slug: params.slug })
    .single();

  return json({ recipe: data });
};

interface IIndexViewProps {}

const Paragraph = (props) => (
  <ul className="my-4">
    {props.input.split("\n").map((line, index) => (
      <li key={index}>{line}</li>
    ))}
  </ul>
);

const View = (props: IIndexViewProps) => {
  const { name, ingredients, instructions, user } = props.recipe;

  return (
    <div>
      <h2 className="font-bold text-4xl my-2">{name}</h2>
      <Paragraph input={ingredients} />
      <Paragraph input={instructions} />
      <h4 className="space-x-2">
        <span>submitted by:</span>
        <img
          className="inline w-6 rounded-full"
          src={user.avatar}
          alt={user.name}
        />
        <span>{user.name}</span>
      </h4>
    </div>
  );
};

export default function Index() {
  let { recipe } = useLoaderData<IndexData>();

  return <View recipe={recipe} />;
}
